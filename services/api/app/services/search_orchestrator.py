"""
검색 오케스트레이터 - 검색 파이프라인 전체 흐름 관리

1. 입력 정규화 → 2. 질의 확장 → 3. 병렬 소스 검색 →
4. 결과 정규화 → 5. 중복 제거 → 6. DB 저장
"""
import asyncio
import logging
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.search import QueryJob, SourceResult, JobStatus, ExtractedSignal
from app.services.query_expander import expand_queries
from app.services.normalizer import deduplicate_results, sort_results, build_summary, build_summary_from_models
from app.services.signal_extractor import extract_signals
from app.services.scoring import calculate_scores
from app.connectors.naver import search_naver
from app.connectors.youtube import search_youtube

logger = logging.getLogger(__name__)


async def run_search_pipeline(job_id: str, raw_query: str, db: AsyncSession) -> None:
    """
    검색 파이프라인 실행

    병렬 전략:
    - NAVER 4개 소스 (blog, cafe, news, shopping) 동시 실행
    - YouTube 동시 실행
    - 총 5개 코루틴을 asyncio.gather로 한 번에
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
        logger.info(f"[{job_id}] 질의 확장: '{raw_query}'")
        expansion = expand_queries(raw_query)
        job.normalized_query = expansion["normalized_query"]
        job.expanded_queries_json = {
            "category": expansion["category"],
            "queries": expansion["expanded_queries"],
        }
        job.sources_plan_json = expansion["source_plan"]
        await db.commit()

        # 2. 전체 병렬 검색 (NAVER 4개 + YouTube 1개 동시 실행)
        logger.info(f"[{job_id}] 병렬 검색 시작 (5개 소스 동시)")
        source_plan = expansion["source_plan"]

        tasks = [
            _safe_search(search_naver, "naver_blog",     source_plan.get("naver_blog", [])),
            _safe_search(search_naver, "naver_cafe",     source_plan.get("naver_cafe", [])),
            _safe_search(search_naver, "naver_news",     source_plan.get("naver_news", [])),
            _safe_search(search_naver, "naver_shopping", source_plan.get("naver_shopping", [])),
            _safe_search_youtube(source_plan.get("youtube", [])),
        ]

        results_lists = await asyncio.gather(*tasks)

        all_results = []
        for result_list in results_lists:
            all_results.extend(result_list)

        logger.info(f"[{job_id}] 총 {len(all_results)}건 수집 완료")

        # 3. 중복 제거 + 정렬
        unique_results = deduplicate_results(all_results)
        sorted_results = sort_results(unique_results)

        # 4. DB 저장 및 신호 추출
        saved_models = []
        for r in sorted_results:
            result_obj = SourceResult(
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
            
            # 신호 추출
            extracted = extract_signals(
                title=result_obj.title,
                snippet=result_obj.snippet or "",
                platform=result_obj.platform
            )
            
            signal_models = []
            for sig in extracted:
                signal_obj = ExtractedSignal(
                    signal_type=sig["signal_type"],
                    signal_group=sig["signal_group"],
                    confidence=sig["confidence"],
                    matched_text=sig["matched_text"]
                )
                signal_models.append(signal_obj)
                result_obj.extracted_signals.append(signal_obj)
                
            # 신뢰도 점수 계산
            scores = calculate_scores(signal_models)
            result_obj.crs = scores["crs"]
            result_obj.eqs = scores["eqs"]
            result_obj.tss = scores["tss"]
            result_obj.tier = scores["tier"]
            result_obj.explanations_json = scores["explanation"]
                
            db.add(result_obj)
            saved_models.append(result_obj)

        # 5. 완료 처리
        summary = build_summary_from_models(saved_models)
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
    if not queries:
        return []
    try:
        return await search_fn(source_type, queries)
    except Exception as e:
        logger.error(f"소스 검색 실패 ({source_type}): {e}")
        return []


async def _safe_search_youtube(queries: list[str]) -> list[dict]:
    """YouTube 커넥터 안전 래퍼"""
    if not queries:
        return []
    try:
        return await search_youtube(queries)
    except Exception as e:
        logger.error(f"YouTube 검색 실패: {e}")
        return []
