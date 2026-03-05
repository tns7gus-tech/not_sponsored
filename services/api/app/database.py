"""
SQLAlchemy 비동기 데이터베이스 연결 모듈

로컬 개발: SQLite + aiosqlite (greenlet 빌드 이슈 회피)
프로덕션(Railway): PostgreSQL + asyncpg
"""
import logging
import os
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

logger = logging.getLogger(__name__)

# 로컬 개발용: SQLite 사용 (DATABASE_URL이 postgresql이면 sqlite로 폴백)
_db_url = settings.DATABASE_URL
if _db_url.startswith("postgresql"):
    # 로컬에서 PostgreSQL 없으면 SQLite로 폴백
    _sqlite_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data.db")
    _db_url = f"sqlite+aiosqlite:///{_sqlite_path}"
    logger.info(f"로컬 개발 모드: SQLite 사용 ({_sqlite_path})")

# 비동기 엔진 생성 (SQLite는 pool_size/max_overflow 미지원)
engine_kwargs = {"echo": False}
if not _db_url.startswith("sqlite"):
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20

engine = create_async_engine(_db_url, **engine_kwargs)

# 세션 팩토리
async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """ORM 모델 베이스 클래스"""
    pass


async def get_db() -> AsyncSession:
    """FastAPI 의존성 주입용 DB 세션 제너레이터"""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
