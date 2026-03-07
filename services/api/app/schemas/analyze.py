"""
Pydantic 스키마 정의 - URL 분석 API 요청/응답 모델.
"""

from typing import Optional

from pydantic import BaseModel, Field, field_validator

from app.schemas.search import SourceResultResponse


class AnalyzeUrlRequest(BaseModel):
    """URL 분석 요청."""

    url: str = Field(..., description="분석할 URL", min_length=5, max_length=2000)

    @field_validator("url")
    @classmethod
    def normalize_url(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("URL을 입력해주세요.")
        return normalized


class AnalyzeUrlJobResponse(BaseModel):
    """URL 분석 작업 생성 응답."""

    job_id: str
    status: str


class AnalyzeUrlJobDetailResponse(BaseModel):
    """URL 분석 작업 상세 응답."""

    job_id: str
    status: str
    url: str
    result: Optional[SourceResultResponse] = None
    created_at: Optional[str] = None
    finished_at: Optional[str] = None
    error_message: Optional[str] = None
