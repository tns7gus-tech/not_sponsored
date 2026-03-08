from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.limiter import limiter
from app.models.search import JobStatus, QueryJob, SourceResult
from app.schemas.search import (
    EngagementData,
    SearchJobDetailResponse,
    SearchJobResponse,
    SearchProgressResponse,
    SearchRequest,
    SearchSummaryResponse,
    SourceResultResponse,
)
from app.services.search_orchestrator import run_search_pipeline

logger = logging.getLogger(__name__)

TRENDING_LIMIT = 6
TRENDING_LOOKBACK_DAYS = 30
ROTATING_FALLBACK_QUERIES = [
    "러닝화 추천",
    "노이즈 캔슬링 이어폰",
    "가성비 태블릿",
    "건성 피부 토너",
    "무선 청소기",
    "블랙박스 비교",
    "캠핑 의자 추천",
    "단백질 쉐이크",
    "초등학생 책가방",
    "공기청정기 필터",
    "커피머신 입문용",
    "수분크림 추천",
    "트레일 러닝화",
    "게이밍 마우스",
    "전기면도기 비교",
    "고양이 자동급식기",
    "목 어깨 마사지기",
    "홈카페 원두",
]

router = APIRouter(prefix="/api/search", tags=["search"])


@router.post("", response_model=SearchJobResponse)
@limiter.limit("5/minute")
async def create_search(
    request: Request,
    req: SearchRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    logger.info("Search request: '%s'", req.query)

    job = QueryJob(raw_query=req.query, status=JobStatus.QUEUED.value)
    db.add(job)
    await db.commit()
    await db.refresh(job)

    background_tasks.add_task(_run_pipeline_with_session, job.id, req.query)
    return SearchJobResponse(job_id=job.id, status=job.status)


@router.get("/trending", response_model=list[str])
async def get_trending_searches(db: AsyncSession = Depends(get_db)):
    lookback_start = datetime.utcnow() - timedelta(days=TRENDING_LOOKBACK_DAYS)

    trending_query = (
        select(
            QueryJob.raw_query,
            func.count(QueryJob.id).label("hits"),
            func.max(QueryJob.created_at).label("last_seen"),
        )
        .where(
            QueryJob.status == JobStatus.COMPLETED.value,
            QueryJob.created_at >= lookback_start,
        )
        .group_by(QueryJob.raw_query)
        .order_by(func.count(QueryJob.id).desc(), func.max(QueryJob.created_at).desc())
        .limit(TRENDING_LIMIT * 2)
    )
    trending_rows = (await db.execute(trending_query)).all()
    trending_queries = [
        normalized
        for raw_query, _, _ in trending_rows
        if (normalized := _normalize_query(raw_query))
    ]

    recent_query = (
        select(QueryJob.raw_query)
        .where(QueryJob.raw_query.is_not(None))
        .order_by(QueryJob.created_at.desc())
        .limit(TRENDING_LIMIT * 6)
    )
    recent_rows = await db.execute(recent_query)
    recent_queries = [
        normalized
        for raw_query in recent_rows.scalars().all()
        if (normalized := _normalize_query(raw_query))
    ]

    return _merge_unique_queries(
        trending_queries,
        recent_queries,
        _rotating_fallback_queries(),
    )[:TRENDING_LIMIT]


@router.get("/{job_id}", response_model=SearchJobDetailResponse)
async def get_search_results(
    job_id: str,
    platform: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    job = await db.get(QueryJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="검색 작업을 찾을 수 없습니다.")

    query = select(SourceResult).where(SourceResult.query_job_id == job_id)
    if platform:
        query = query.where(SourceResult.platform == platform)
    query = query.order_by(SourceResult.created_at)

    result = await db.execute(query)
    source_results = result.scalars().all()

    results_response = []
    for source_result in source_results:
        engagement = None
        if source_result.engagement_json:
            engagement = EngagementData(
                likes=source_result.engagement_json.get("likes"),
                comments=source_result.engagement_json.get("comments"),
                views=source_result.engagement_json.get("views"),
            )

        results_response.append(
            SourceResultResponse(
                id=source_result.id,
                platform=source_result.platform,
                url=source_result.url,
                title=source_result.title,
                author_name=source_result.author_name,
                published_at=source_result.published_at,
                snippet=source_result.snippet,
                media_types=source_result.media_types,
                engagement=engagement,
                crs=source_result.crs,
                eqs=source_result.eqs,
                tss=source_result.tss,
                tier=source_result.tier,
                explanations=source_result.explanations_json or [],
            )
        )

    expanded_queries = None
    if job.expanded_queries_json:
        expanded_queries = job.expanded_queries_json.get("queries", [])

    summary = None
    if job.summary_json:
        summary = SearchSummaryResponse(
            total_results=job.summary_json.get("total_results", 0),
            platforms=job.summary_json.get("platforms", []),
            tier_distribution=job.summary_json.get("tier_distribution", {}),
            pros=job.summary_json.get("pros", []),
            cons=job.summary_json.get("cons", []),
            overall_status=job.summary_json.get("overall_status"),
        )

    progress = None
    if job.status == JobStatus.RUNNING.value:
        progress = SearchProgressResponse(
            connectors_total=5,
            connectors_done=len({item.platform for item in source_results}),
            results_collected=len(source_results),
        )

    return SearchJobDetailResponse(
        job_id=job.id,
        status=job.status,
        query=job.raw_query,
        expanded_queries=expanded_queries,
        progress=progress,
        summary=summary,
        results=results_response,
        created_at=job.created_at.isoformat() if job.created_at else None,
        finished_at=job.finished_at.isoformat() if job.finished_at else None,
        error_message=job.error_message,
    )


def _normalize_query(raw_query: Optional[str]) -> str:
    return (raw_query or "").strip()


def _merge_unique_queries(*groups: list[str]) -> list[str]:
    merged: list[str] = []
    seen: set[str] = set()

    for group in groups:
        for item in group:
            normalized = _normalize_query(item)
            if not normalized:
                continue

            dedupe_key = normalized.casefold()
            if dedupe_key in seen:
                continue

            seen.add(dedupe_key)
            merged.append(normalized)

    return merged


def _rotating_fallback_queries() -> list[str]:
    pool_size = len(ROTATING_FALLBACK_QUERIES)
    start_index = datetime.utcnow().date().toordinal() % pool_size
    step = 5

    return [
        ROTATING_FALLBACK_QUERIES[(start_index + (offset * step)) % pool_size]
        for offset in range(pool_size)
    ]


async def _run_pipeline_with_session(job_id: str, raw_query: str):
    from app.database import async_session

    async with async_session() as db:
        try:
            await run_search_pipeline(job_id, raw_query, db)
        except Exception as exc:
            logger.error("Background search pipeline error: %s", exc, exc_info=True)
