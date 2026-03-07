from __future__ import annotations
import logging
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.feedback import FeedbackEvent
from app.schemas.feedback import FeedbackCreateRequest, FeedbackResponse
from app.limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/feedback", tags=["피드백"])

@router.post("", response_model=FeedbackResponse)
@limiter.limit("15/minute")
async def submit_feedback(
    request: Request,
    req: FeedbackCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """사용자 피드백 (도움됨 / 광고 같음) 제출"""
    if req.feedback_type not in ["helpful", "ad_suspected"]:
        raise HTTPException(status_code=400, detail="올바르지 않은 피드백 타입입니다.")

    logger.info(f"피드백 접수: {req.feedback_type} (Result ID: {req.source_result_id}, URL: {req.url})")

    event = FeedbackEvent(
        source_result_id=req.source_result_id,
        url=req.url,
        feedback_type=req.feedback_type,
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)

    return FeedbackResponse(id=event.id, status="success")
