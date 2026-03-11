import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.database import Base, engine
from app.limiter import limiter
from app.routes.analytics import router as analytics_router
from app.routes.analyze import router as analyze_router
from app.routes.feedback import router as feedback_router
from app.routes.search import router as search_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

DB_STARTUP_RETRIES = 15
DB_RETRY_DELAY_SECONDS = 4


async def _prepare_database() -> None:
    last_error: Exception | None = None

    for attempt in range(1, DB_STARTUP_RETRIES + 1):
        try:
            logger.info(
                "Preparing database schema (attempt %s/%s)",
                attempt,
                DB_STARTUP_RETRIES,
            )
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("Database schema is ready")
            return
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            logger.exception(
                "Database startup failed (attempt %s/%s)",
                attempt,
                DB_STARTUP_RETRIES,
            )
            if attempt == DB_STARTUP_RETRIES:
                break
            await asyncio.sleep(DB_RETRY_DELAY_SECONDS)

    raise RuntimeError("Database was not reachable during startup") from last_error


@asynccontextmanager
async def lifespan(app: FastAPI):
    await _prepare_database()
    yield
    logger.info("API shutdown complete")


app = FastAPI(
    title="Trust Research Agent API",
    description="Purchase research API that separates ad signals from evidence-based trust signals",
    version="0.1.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "0"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "camera=(), geolocation=(), microphone=()"
    response.headers["Content-Security-Policy"] = (
        "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
    )
    if request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


app.include_router(search_router)
app.include_router(analyze_router)
app.include_router(analytics_router)
app.include_router(feedback_router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "trust-research-agent-api"}
