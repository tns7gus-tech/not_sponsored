"""
검색 API 라우터.

POST /api/search
GET  /api/search/{job_id}
"""

from __future__ import annotations

import logging
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

router = APIRouter(prefix="/api/search", tags=["검색"])


@router.post("", response_model=SearchJobResponse)
@limiter.limit("5/minute")
async def create_search(
    request: Request,
    req: SearchRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """검색 작업을 생성하고 백그라운드 파이프라인을 시작한다."""
    logger.info("검색 요청: '%s'", req.query)

    job = QueryJob(raw_query=req.query, status=JobStatus.QUEUED.value)
    db.add(job)
    await db.commit()
    await db.refresh(job)

    background_tasks.add_task(_run_pipeline_with_session, job.id, req.query)
    return SearchJobResponse(job_id=job.id, status=job.status)


@router.get("/trending", response_model=list[str])
async def get_trending_searches(db: AsyncSession = Depends(get_db)):
    """최근 자주 검색된 키워드를 반환한다."""
    query = (
        select(QueryJob.raw_query)
        .where(QueryJob.status == JobStatus.COMPLETED.value)
        .group_by(QueryJob.raw_query)
        .order_by(func.count(QueryJob.id).desc())
        .limit(6)
    )
    result = await db.execute(query)
    trending = result.scalars().all()

    default_queries = [
        "아이폰17",
        "나이키 페가수스 42",
        "쿠션 파운데이션",
        "에어프라이어",
        "갤럭시 S26",
        "건성 피부 선크림",
    ]

    final_queries = list(trending)
    for item in default_queries:
        if len(final_queries) >= 6:
            break
        if item not in final_queries:
            final_queries.append(item)

    return final_queries


@router.get("/{job_id}", response_model=SearchJobDetailResponse)
async def get_search_results(
    job_id: str,
    platform: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """검색 결과와 진행 상태를 반환한다."""
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


async def _run_pipeline_with_session(job_id: str, raw_query: str):
    """백그라운드 검색 파이프라인을 별도 세션에서 실행한다."""
    from app.database import async_session

    async with async_session() as db:
        try:
            await run_search_pipeline(job_id, raw_query, db)
        except Exception as exc:
            logger.error("백그라운드 검색 파이프라인 오류: %s", exc, exc_info=True)
