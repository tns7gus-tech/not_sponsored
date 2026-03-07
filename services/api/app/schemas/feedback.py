"""
Pydantic 스키마 정의 - 피드백 API 요청/응답 모델
"""
from pydantic import BaseModel, Field
from typing import Optional

class FeedbackCreateRequest(BaseModel):
    """피드백 제출 요청"""
    source_result_id: Optional[str] = Field(None, description="결과 ID (검색/분석 결과)")
    url: Optional[str] = Field(None, description="피드백 대상 URL")
    feedback_type: str = Field(..., description="'helpful' 또는 'ad_suspected'")

class FeedbackResponse(BaseModel):
    """피드백 응답"""
    id: str
    status: str
