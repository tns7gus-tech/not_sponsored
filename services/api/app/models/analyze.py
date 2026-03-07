"""
ORM 모델 정의 - 단일 URL 분석 작업 테이블
"""
from __future__ import annotations
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, Integer, DateTime, JSON, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.search import JobStatus, SourceResult

class UrlAnalysisJob(Base):
    """URL 분석 작업 테이블"""
    __tablename__ = "url_analysis_jobs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    url: Mapped[str] = mapped_column(String(2000), nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), default=JobStatus.QUEUED.value, nullable=False
    )
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # 연결된 결과 (단일)
    result_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("source_results.id", ondelete="SET NULL"), nullable=True
    )
    result: Mapped[Optional["SourceResult"]] = relationship(foreign_keys=[result_id])

    __table_args__ = (
        Index("ix_url_analysis_jobs_status", "status"),
        Index("ix_url_analysis_jobs_created_at", "created_at"),
    )
