"""
Pydantic 스키마 정의 - API 요청/응답 모델
"""
from pydantic import BaseModel, Field
from typing import Optional, List


# === 검색 요청/응답 스키마 ===

class SearchRequest(BaseModel):
    """검색 요청"""
    query: str = Field(..., min_length=1, max_length=500, description="검색할 제품명 또는 질문")
    locale: str = Field(default="ko-KR", description="검색 로케일")


class SearchJobResponse(BaseModel):
    """검색 작업 생성 응답"""
    job_id: str
    status: str


class EngagementData(BaseModel):
    """참여 지표"""
    likes: Optional[int] = None
    comments: Optional[int] = None
    views: Optional[int] = None


class SourceResultResponse(BaseModel):
    """개별 검색 결과 응답"""
    id: str
    platform: str
    url: str
    title: str
    author_name: Optional[str] = None
    published_at: Optional[str] = None
    snippet: Optional[str] = None
    media_types: Optional[List[str]] = None
    engagement: Optional[EngagementData] = None
    
    # 신뢰도 스코어 (Sprint 2)
    crs: Optional[int] = None
    eqs: Optional[int] = None
    tss: Optional[int] = None
    tier: Optional[str] = None
    explanations: Optional[List[str]] = Field(default_factory=list)


class SearchProgressResponse(BaseModel):
    """검색 진행 상태"""
    connectors_done: int = 0
    connectors_total: int = 0
    results_collected: int = 0


class SearchSummaryResponse(BaseModel):
    """검색 요약 (Sprint 2에서 확장)"""
    total_results: int = 0
    platforms: List[str] = []


class SearchJobDetailResponse(BaseModel):
    """검색 작업 상세 응답"""
    job_id: str
    status: str
    query: str
    expanded_queries: Optional[List[str]] = None
    progress: Optional[SearchProgressResponse] = None
    summary: Optional[SearchSummaryResponse] = None
    results: List[SourceResultResponse] = []
    created_at: Optional[str] = None
    finished_at: Optional[str] = None
    error_message: Optional[str] = None
