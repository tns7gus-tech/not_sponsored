from __future__ import annotations

import re
from typing import Any, Optional

from pydantic import BaseModel, Field, field_validator


EVENT_TYPE_PATTERN = re.compile(r"^[a-z0-9_:-]{2,64}$")


class AnalyticsEventCreateRequest(BaseModel):
    event_type: str = Field(..., description="이벤트 타입")
    page_path: Optional[str] = Field(None, description="페이지 경로")
    referrer: Optional[str] = Field(None, description="유입 참조 URL")
    session_id: Optional[str] = Field(None, description="브라우저 세션 식별자")
    query_text: Optional[str] = Field(None, description="검색 질의")
    job_id: Optional[str] = Field(None, description="검색 또는 분석 작업 ID")
    details: Optional[dict[str, Any]] = Field(None, description="부가 속성")

    @field_validator("event_type")
    @classmethod
    def validate_event_type(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not EVENT_TYPE_PATTERN.match(normalized):
            raise ValueError("event_type 형식이 올바르지 않습니다.")
        return normalized

    @field_validator("page_path", "referrer", "session_id", "query_text", "job_id")
    @classmethod
    def normalize_optional_strings(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        normalized = value.strip()
        return normalized or None


class AnalyticsEventResponse(BaseModel):
    id: str
    status: str
