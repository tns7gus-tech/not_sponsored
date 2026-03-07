"""
ORM 모델 정의 - 검색 작업 및 결과 테이블.
"""

from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import JSON, DateTime, Float, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class JobStatus(str, enum.Enum):
    """검색 작업 상태."""

    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class Platform(str, enum.Enum):
    """검색 소스 플랫폼."""

    NAVER_BLOG = "naver_blog"
    NAVER_CAFE = "naver_cafe"
    NAVER_NEWS = "naver_news"
    NAVER_SHOPPING = "naver_shopping"
    YOUTUBE = "youtube"
    WEB = "web"
    WEB_ANALYSIS = "web_analysis"


class QueryJob(Base):
    """사용자의 검색 요청 단위."""

    __tablename__ = "query_jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    raw_query: Mapped[str] = mapped_column(String(500), nullable=False)
    normalized_query: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default=JobStatus.QUEUED.value, nullable=False)
    expanded_queries_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    sources_plan_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    summary_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    total_results: Mapped[Optional[int]] = mapped_column(Integer, default=0, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    source_results: Mapped[List["SourceResult"]] = relationship(
        back_populates="query_job",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        Index("ix_query_jobs_status", "status"),
        Index("ix_query_jobs_created_at", "created_at"),
    )


class SourceResult(Base):
    """소스별 개별 검색 결과."""

    __tablename__ = "source_results"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    query_job_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("query_jobs.id", ondelete="CASCADE"),
        nullable=True,
    )
    platform: Mapped[str] = mapped_column(String(30), nullable=False)
    url: Mapped[str] = mapped_column(String(2000), nullable=False)
    canonical_url: Mapped[Optional[str]] = mapped_column(String(2000), nullable=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    author_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    published_at: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    snippet: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    media_types: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    engagement_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    raw_payload_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    crs: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    eqs: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    tss: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    tier: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    explanations_json: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    query_job: Mapped["QueryJob"] = relationship(back_populates="source_results")
    extracted_signals: Mapped[List["ExtractedSignal"]] = relationship(
        back_populates="source_result",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        Index("ix_source_results_job_id", "query_job_id"),
        Index("ix_source_results_platform", "platform"),
        Index("ix_source_results_url", "url"),
    )


class ExtractedSignal(Base):
    """결과에서 추출된 광고성/실사용 신호."""

    __tablename__ = "extracted_signals"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source_result_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("source_results.id", ondelete="CASCADE"),
        nullable=False,
    )
    signal_type: Mapped[str] = mapped_column(String(50), nullable=False)
    signal_group: Mapped[str] = mapped_column(String(20), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=1.0)
    matched_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    source_result: Mapped["SourceResult"] = relationship(back_populates="extracted_signals")

    __table_args__ = (
        Index("ix_extracted_signals_result_id", "source_result_id"),
        Index("ix_extracted_signals_type", "signal_type"),
    )
