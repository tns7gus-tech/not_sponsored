"""
앱 환경변수 설정 모듈
"""
import logging
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    """환경변수 기반 앱 설정"""
    # 데이터베이스
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/not_sponsored"
    REDIS_URL: str = "redis://localhost:6379/0"

    # NAVER Search API
    NAVER_CLIENT_ID: str = ""
    NAVER_CLIENT_SECRET: str = ""

    # YouTube Data API
    YOUTUBE_API_KEY: str = ""

    # 앱 설정
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:3000"
    CORS_ORIGINS: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
