"""
신뢰도 기반 구매 리서치 에이전트 - FastAPI 앱 엔트리포인트
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routes.search import router as search_router

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """앱 시작/종료 시 DB 테이블 자동 생성"""
    logger.info("앱 시작 - DB 테이블 초기화")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("DB 테이블 준비 완료")
    yield
    logger.info("앱 종료")


app = FastAPI(
    title="Trust Research Agent API",
    description="신뢰도 기반 구매 리서치 에이전트 - 광고/협찬 가능성이 낮고 근거가 투명한 후기를 우선 탐색합니다",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS 설정
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(search_router)


@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {"status": "ok", "service": "trust-research-agent-api"}
