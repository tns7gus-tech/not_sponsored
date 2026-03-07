"""
ORM 모델 정의 - 사용자 피드백 테이블
"""
from __future__ import annotations
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class FeedbackEvent(Base):
    """사용자 피드백 (도움됨 / 광고 같음) 기록 테이블"""
    __tablename__ = "feedback_events"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    source_result_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    url: Mapped[Optional[str]] = mapped_column(String(2000), nullable=True)
    feedback_type: Mapped[str] = mapped_column(String(20), nullable=False) # 'helpful', 'ad_suspected'
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    __table_args__ = (
        Index("ix_feedback_events_type", "feedback_type"),
        Index("ix_feedback_events_result", "source_result_id"),
    )
