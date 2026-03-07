"""
검색 오케스트레이터 - 검색 파이프라인 전체 흐름 관리

1. 입력 정규화 → 2. 질의 확장 → 3. 병렬 소스 검색 →
4. 결과 정규화 → 5. 중복 제거 → 6. DB 저장
"""
import asyncio
import logging
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.search import QueryJob, SourceResult, JobStatus
from app.services.query_expander import expand_queries
from app.services.normalizer import deduplicate_results, sort_results, build_summary
from app.connectors.naver import search_naver
from app.connectors.youtube import search_youtube

logger = logging.getLogger(__name__)


async def run_search_pipeline(job_id: str, raw_query: str, db: AsyncSession) -> None:
    """
    검색 파이프라인 실행 (동기 처리 - MVP)

    Args:
        job_id: 검색 작업 ID
        raw_query: 원본 검색어
        db: DB 세션
    """
    try:
        # 작업 상태 → running
        job = await db.get(QueryJob, job_id)
        if not job:
            logger.error(f"검색 작업을 찾을 수 없음: {job_id}")
            return

        job.status = JobStatus.RUNNING.value
        await db.commit()

        # 1. 질의 확장
        logger.info(f"[{job_id}] 질의 확장 시작: '{raw_query}'")
        expansion = expand_queries(raw_query)
        job.normalized_query = expansion["normalized_query"]
        job.expanded_queries_json = {
            "category": expansion["category"],
            "queries": expansion["expanded_queries"],
        }
        job.sources_plan_json = expansion["source_plan"]
        await db.commit()

        # 2. 소스 검색 (NAVER는 순차, YouTube는 병렬)
        logger.info(f"[{job_id}] 소스 검색 시작")
        source_plan = expansion["source_plan"]

        # NAVER 커넥터들 (순차 실행 - Rate limit 방지)
        naver_results = []
        for source_type in ["naver_blog", "naver_cafe", "naver_news", "naver_shopping"]:
            queries = source_plan.get(source_type, [])
            if queries:
                results = await _safe_search(search_naver, source_type, queries)
                naver_results.extend(results)

        # YouTube 커넥터 (독립 실행)
        yt_results = []
        yt_queries = source_plan.get("youtube", [])
        if yt_queries:
            yt_results = await _safe_search_youtube(yt_queries)

        # 결과 합치기
        all_results = naver_results + yt_results

        logger.info(f"[{job_id}] 총 {len(all_results)}건 수집 완료")

        # 3. 중복 제거 + 정렬
        unique_results = deduplicate_results(all_results)
        sorted_results = sort_results(unique_results)

        # 4. DB 저장
        for r in sorted_results:
            source_result = SourceResult(
                query_job_id=job_id,
                platform=r.get("platform", "unknown"),
                url=r.get("url", ""),
                canonical_url=r.get("canonical_url"),
                title=r.get("title", ""),
                author_name=r.get("author_name"),
                published_at=r.get("published_at"),
                snippet=r.get("snippet"),
                media_types=r.get("media_types"),
                engagement_json=r.get("engagement_json"),
                raw_payload_json=r.get("raw_payload_json"),
            )
            db.add(source_result)

        # 5. 작업 완료 처리
        summary = build_summary(sorted_results)
        job.summary_json = summary
        job.total_results = len(sorted_results)
        job.status = JobStatus.COMPLETED.value
        job.finished_at = datetime.utcnow()
        await db.commit()

        logger.info(f"[{job_id}] 검색 완료: {len(sorted_results)}건 저장")

    except Exception as e:
        logger.error(f"[{job_id}] 검색 파이프라인 에러: {e}", exc_info=True)
        try:
            job = await db.get(QueryJob, job_id)
            if job:
                job.status = JobStatus.FAILED.value
                job.error_message = str(e)
                job.finished_at = datetime.utcnow()
                await db.commit()
        except Exception:
            logger.error(f"[{job_id}] 에러 상태 저장 실패")


async def _safe_search(search_fn, source_type: str, queries: list[str]) -> list[dict]:
    """커넥터 실패 시에도 빈 리스트 반환 (부분 실패 허용)"""
    try:
        return await search_fn(source_type, queries)
    except Exception as e:
        logger.error(f"소스 검색 실패 ({source_type}): {e}")
        return []


async def _safe_search_youtube(queries: list[str]) -> list[dict]:
    """YouTube 커넥터 안전 래퍼"""
    try:
        return await search_youtube(queries)
    except Exception as e:
        logger.error(f"YouTube 검색 실패: {e}")
        return []
