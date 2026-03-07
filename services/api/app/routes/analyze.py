from __future__ import annotations

import logging

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.limiter import limiter
from app.models.analyze import UrlAnalysisJob
from app.models.search import JobStatus
from app.schemas.analyze import (
    AnalyzeUrlJobDetailResponse,
    AnalyzeUrlJobResponse,
    AnalyzeUrlRequest,
)
from app.schemas.search import EngagementData, SourceResultResponse
from app.services.analyze_orchestrator import run_analyze_pipeline
from app.services.url_safety import validate_public_url

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/analyze-url", tags=["URL 분석"])


@router.post("", response_model=AnalyzeUrlJobResponse)
@limiter.limit("5/minute")
async def create_analyze_job(
    request: Request,
    req: AnalyzeUrlRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """URL 분석 작업을 생성하고 백그라운드에서 실행한다."""
    try:
        normalized_url = await validate_public_url(req.url)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    logger.info("URL 분석 요청: '%s'", normalized_url)

    job = UrlAnalysisJob(url=normalized_url, status=JobStatus.QUEUED.value)
    db.add(job)
    await db.commit()
    await db.refresh(job)

    background_tasks.add_task(_run_analyze_pipeline_with_session, job.id, normalized_url)
    return AnalyzeUrlJobResponse(job_id=job.id, status=job.status)


@router.get("/{job_id}", response_model=AnalyzeUrlJobDetailResponse)
async def get_analyze_result(job_id: str, db: AsyncSession = Depends(get_db)):
    """URL 분석 결과를 조회한다."""
    job = await db.get(UrlAnalysisJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="분석 작업을 찾을 수 없습니다.")

    result_response = None
    if job.result_id:
        from app.models.search import SourceResult

        source_result = await db.get(SourceResult, job.result_id)
        if source_result:
            engagement = None
            if source_result.engagement_json:
                engagement = EngagementData(
                    likes=source_result.engagement_json.get("likes"),
                    comments=source_result.engagement_json.get("comments"),
                    views=source_result.engagement_json.get("views"),
                )

            result_response = SourceResultResponse(
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

    return AnalyzeUrlJobDetailResponse(
        job_id=job.id,
        status=job.status,
        url=job.url,
        result=result_response,
        created_at=job.created_at.isoformat() if job.created_at else None,
        finished_at=job.finished_at.isoformat() if job.finished_at else None,
        error_message=job.error_message,
    )


async def _run_analyze_pipeline_with_session(job_id: str, url: str):
    """백그라운드 URL 분석 파이프라인을 별도 세션에서 실행한다."""
    from app.database import async_session

    async with async_session() as db:
        try:
            await run_analyze_pipeline(job_id, url, db)
        except Exception as exc:
            logger.error("백그라운드 URL 분석 파이프라인 오류: %s", exc, exc_info=True)
