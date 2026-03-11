from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.limiter import limiter
from app.models.analytics import AnalyticsEvent
from app.schemas.analytics import AnalyticsEventCreateRequest, AnalyticsEventResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.post("/events", response_model=AnalyticsEventResponse)
@limiter.limit("120/minute")
async def create_analytics_event(
    request: Request,
    req: AnalyticsEventCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    event = AnalyticsEvent(
        event_type=req.event_type,
        page_path=req.page_path,
        referrer=req.referrer,
        session_id=req.session_id,
        query_text=req.query_text,
        job_id=req.job_id,
        details_json=req.details,
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)

    logger.info("Analytics event stored: %s (%s)", event.event_type, event.page_path or "-")
    return AnalyticsEventResponse(id=event.id, status="ok")
