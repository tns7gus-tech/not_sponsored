"""
Pydantic 스키마 정의 - URL 분석 API 요청/응답 모델
"""
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional
from app.schemas.search import SourceResultResponse

class AnalyzeUrlRequest(BaseModel):
    """URL 분석 요청"""
    url: str = Field(..., description="분석할 URL", min_length=5, max_length=2000)


class AnalyzeUrlJobResponse(BaseModel):
    """URL 분석 작업 생성 응답"""
    job_id: str
    status: str


class AnalyzeUrlJobDetailResponse(BaseModel):
    """URL 분석 작업 상세 응답"""
    job_id: str
    status: str
    url: str
    result: Optional[SourceResultResponse] = None
    created_at: Optional[str] = None
    finished_at: Optional[str] = None
    error_message: Optional[str] = None
