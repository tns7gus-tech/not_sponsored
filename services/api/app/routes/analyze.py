from __future__ import annotations
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.search import JobStatus
from app.models.analyze import UrlAnalysisJob
from app.schemas.analyze import (
    AnalyzeUrlRequest,
    AnalyzeUrlJobResponse,
    AnalyzeUrlJobDetailResponse,
)
from app.schemas.search import SourceResultResponse, EngagementData
from app.services.analyze_orchestrator import run_analyze_pipeline
from app.limiter import limiter

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
    """URL 분석 시작 - 작업을 생성하고 비동기로 실행"""
    logger.info(f"URL 분석 요청: '{req.url}'")

    # 작업 생성
    job = UrlAnalysisJob(
        url=req.url,
        status=JobStatus.QUEUED.value,
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)

    # 백그라운드 파이프라인
    background_tasks.add_task(_run_analyze_pipeline_with_session, job.id, req.url)

    return AnalyzeUrlJobResponse(job_id=job.id, status=job.status)


@router.get("/{job_id}", response_model=AnalyzeUrlJobDetailResponse)
async def get_analyze_result(
    job_id: str,
    db: AsyncSession = Depends(get_db),
):
    """URL 분석 결과 조회"""
    job = await db.get(UrlAnalysisJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="분석 작업을 찾을 수 없습니다")

    result_response = None
    if job.result_id:
        # result_id를 통해 SourceResult 조회
        from app.models.search import SourceResult
        sr = await db.get(SourceResult, job.result_id)
        if sr:
            engagement = None
            if sr.engagement_json:
                engagement = EngagementData(
                    likes=sr.engagement_json.get("likes"),
                    comments=sr.engagement_json.get("comments"),
                    views=sr.engagement_json.get("views"),
                )

            result_response = SourceResultResponse(
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
    """"백그라운드 태스크에서 별도 DB 세션으로 URL 분석 파이프라인 실행"""
    from app.database import async_session

    async with async_session() as db:
        try:
            await run_analyze_pipeline(job_id, url, db)
        except Exception as e:
            logger.error(f"백그라운드 분석 파이프라인 에러: {e}", exc_info=True)
