import logging
from typing import Optional
import httpx
from datetime import datetime
from bs4 import BeautifulSoup
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.search import JobStatus, SourceResult
from app.models.analyze import UrlAnalysisJob

from app.services.signal_extractor import SignalExtractor
from app.services.scoring import ScoringEngine

logger = logging.getLogger(__name__)

async def run_analyze_pipeline(job_id: str, url: str, db: AsyncSession):
    """지정된 URL을 단일 분석하는 파이프라인"""
    # 1. Job 상태 변경
    job = await db.get(UrlAnalysisJob, job_id)
    if not job:
        logger.error(f"분석 작업 {job_id}를 찾을 수 없습니다.")
        return

    job.status = JobStatus.RUNNING.value
    await db.commit()


    try:
        # 2. URL 본문 추출
        html_content = await _fetch_url_content(url)
        content_data = _parse_html(html_content, url)

        # 3. SourceResult 생성 (query_job_id 없이 저장)
        source_result = SourceResult(
            platform="web_analysis",
            url=url,
            title=content_data.get("title", "No Title"),
            author_name=content_data.get("author", ""),
            snippet=content_data.get("snippet", ""),
            media_types=["text"]
        )
        
        # 4. 신호 추출 및 평가
        signals = SignalExtractor.extract_all(content_data.get("snippet", ""), url)
        
        # 가짜 SourceResult 객체 (Score Engine 용)
        class _MockSourceResult:
            def __init__(self, platform, snippet, engagement):
                self.platform = platform
                self.snippet = snippet
                self.engagement_json = engagement
                
        mock_sr = _MockSourceResult("web", content_data.get("snippet", ""), None)
        score_data = ScoringEngine.calculate_score(mock_sr, signals)
        
        source_result.crs = score_data["crs"]
        source_result.eqs = score_data["eqs"]
        source_result.tss = score_data["tss"]
        source_result.tier = score_data["tier"]
        source_result.explanations_json = [e["message"] for e in score_data["explanations"]]
        
        # 5. DB 저장
        db.add(source_result)
        await db.commit()
        await db.refresh(source_result)

        # 6. Job 업데이트
        job.status = JobStatus.COMPLETED.value
        job.result_id = source_result.id
        job.finished_at = datetime.utcnow()
        await db.commit()
        
    except Exception as e:
        logger.error(f"URL 분석 파이프라인 오류 ({job_id}): {e}", exc_info=True)
        job.status = JobStatus.FAILED.value
        job.error_message = str(e)
        job.finished_at = datetime.utcnow()
        await db.commit()
        return

async def _fetch_url_content(url: str) -> str:
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; TrustResearchAgent/1.0)"
    }
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        response = await client.get(url, headers=headers)
        response.raise_for_status()
        return response.text

def _parse_html(html: str, url: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")
    title = soup.title.string if soup.title else url
    
    # 본문 스니펫 (가장 긴 p 태그들 위주로 조합) # 단순 구현
    paragraphs = soup.find_all("p")
    text_content = " ".join([p.get_text(strip=True) for p in paragraphs if len(p.get_text(strip=True)) > 20])
    
    snippet = text_content[:3000] # 최대 3000자
    
    return {
        "title": title.strip() if title else url,
        "author": "",
        "snippet": snippet
    }
