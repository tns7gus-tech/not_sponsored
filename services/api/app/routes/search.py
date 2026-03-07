from __future__ import annotations
"""
검색 API 라우터

POST /api/search     - 검색 시작
GET  /api/search/{job_id} - 검색 결과 조회
"""
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.search import QueryJob, SourceResult, JobStatus
from app.schemas.search import (
    SearchRequest,
    SearchJobResponse,
    SearchJobDetailResponse,
    SourceResultResponse,
    SearchProgressResponse,
    SearchSummaryResponse,
    EngagementData,
)
from app.services.search_orchestrator import run_search_pipeline
from app.limiter import limiter

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
    """검색 시작 - 검색 작업을 생성하고 비동기로 실행"""
    logger.info(f"검색 요청: '{req.query}'")

    # 검색 작업 생성
    job = QueryJob(
        raw_query=req.query,
        status=JobStatus.QUEUED.value,
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)

    # 백그라운드에서 검색 파이프라인 실행
    background_tasks.add_task(_run_pipeline_with_session, job.id, req.query)

    return SearchJobResponse(job_id=job.id, status=job.status)


@router.get("/{job_id}", response_model=SearchJobDetailResponse)
async def get_search_results(
    job_id: str,
    platform: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """검색 결과 조회 - 상태 및 결과 반환"""
    job = await db.get(QueryJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="검색 작업을 찾을 수 없습니다")

    # 결과 조회
    query = select(SourceResult).where(SourceResult.query_job_id == job_id)
    if platform:
        query = query.where(SourceResult.platform == platform)
    query = query.order_by(SourceResult.created_at)

    result = await db.execute(query)
    source_results = result.scalars().all()

    # 응답 구성
    results_response = []
    for sr in source_results:
        engagement = None
        if sr.engagement_json:
            engagement = EngagementData(
                likes=sr.engagement_json.get("likes"),
                comments=sr.engagement_json.get("comments"),
                views=sr.engagement_json.get("views"),
            )

        results_response.append(
            SourceResultResponse(
                id=sr.id,
                platform=sr.platform,
                url=sr.url,
                title=sr.title,
                author_name=sr.author_name,
                published_at=sr.published_at,
                snippet=sr.snippet,
                media_types=sr.media_types,
                engagement=engagement,
                crs=sr.crs,
                eqs=sr.eqs,
                tss=sr.tss,
                tier=sr.tier,
                explanations=sr.explanations_json if sr.explanations_json else [],
            )
        )

    # 확장된 질의 목록
    expanded_queries = None
    if job.expanded_queries_json:
        expanded_queries = job.expanded_queries_json.get("queries", [])

    # 요약 정보
    summary = None
    if job.summary_json:
        summary = SearchSummaryResponse(
            total_results=job.summary_json.get("total_results", 0),
            platforms=job.summary_json.get("platforms", []),
        )

    # 진행 상태
    progress = None
    if job.status == JobStatus.RUNNING.value:
        progress = SearchProgressResponse(
            connectors_total=5,
            connectors_done=len(set(r.platform for r in source_results)),
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
    """백그라운드 태스크에서 별도 DB 세션으로 파이프라인 실행"""
    from app.database import async_session

    async with async_session() as db:
        try:
            await run_search_pipeline(job_id, raw_query, db)
        except Exception as e:
            logger.error(f"백그라운드 파이프라인 에러: {e}", exc_info=True)
