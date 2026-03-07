from __future__ import annotations

import logging
import re
from datetime import datetime

import httpx
from bs4 import BeautifulSoup
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.analyze import UrlAnalysisJob
from app.models.search import ExtractedSignal, JobStatus, SourceResult
from app.services.scoring import calculate_scores
from app.services.signal_extractor import extract_signals
from app.services.url_safety import (
    MAX_DOWNLOAD_BYTES,
    MAX_REDIRECTS,
    validate_public_url,
    validate_redirect_target,
)

logger = logging.getLogger(__name__)


async def run_analyze_pipeline(job_id: str, url: str, db: AsyncSession):
    """지정된 공개 URL 하나를 분석한다."""
    job = await db.get(UrlAnalysisJob, job_id)
    if not job:
        logger.error("분석 작업 %s를 찾을 수 없습니다.", job_id)
        return

    job.status = JobStatus.RUNNING.value
    await db.commit()

    try:
        normalized_url = await validate_public_url(url)
        html_content, final_url = await _fetch_url_content(normalized_url)
        content_data = _parse_html(html_content, final_url)

        if not content_data["snippet"]:
            raise ValueError("본문을 충분히 추출하지 못했습니다. 공개 HTML 페이지인지 확인해주세요.")

        source_result = SourceResult(
            platform="web_analysis",
            url=final_url,
            canonical_url=final_url,
            title=content_data.get("title", "No Title"),
            author_name=content_data.get("author") or "",
            snippet=content_data.get("snippet", ""),
            media_types=content_data.get("media_types", ["text"]),
            raw_payload_json={
                "final_url": final_url,
                "meta_description": content_data.get("meta_description"),
            },
        )

        signals = extract_signals(
            source_result.title,
            source_result.snippet or "",
            source_result.platform,
        )
        score_data = calculate_scores(signals)

        source_result.crs = score_data["crs"]
        source_result.eqs = score_data["eqs"]
        source_result.tss = score_data["tss"]
        source_result.tier = score_data["tier"]
        source_result.explanations_json = score_data["explanation"]

        for signal in signals:
            source_result.extracted_signals.append(
                ExtractedSignal(
                    signal_type=signal["signal_type"],
                    signal_group=signal["signal_group"],
                    confidence=signal["confidence"],
                    matched_text=signal["matched_text"],
                )
            )

        db.add(source_result)
        await db.commit()
        await db.refresh(source_result)

        job.status = JobStatus.COMPLETED.value
        job.url = final_url
        job.result_id = source_result.id
        job.finished_at = datetime.utcnow()
        await db.commit()
    except Exception as exc:
        logger.error("URL 분석 파이프라인 오류 (%s): %s", job_id, exc, exc_info=True)
        job.status = JobStatus.FAILED.value
        job.error_message = str(exc)
        job.finished_at = datetime.utcnow()
        await db.commit()


async def _fetch_url_content(url: str) -> tuple[str, str]:
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; TrustResearchAgent/1.0)",
        "Accept": "text/html,application/xhtml+xml",
    }
    timeout = httpx.Timeout(connect=5.0, read=10.0, write=10.0, pool=10.0)

    async with httpx.AsyncClient(timeout=timeout, follow_redirects=False) as client:
        current_url = url

        for _ in range(MAX_REDIRECTS + 1):
            try:
                async with client.stream("GET", current_url, headers=headers) as response:
                    if response.status_code in {301, 302, 303, 307, 308}:
                        location = response.headers.get("location")
                        if not location:
                            raise ValueError("리다이렉트 대상이 비어 있습니다.")
                        current_url = await validate_redirect_target(current_url, location)
                        continue

                    response.raise_for_status()

                    content_type = response.headers.get("content-type", "")
                    if "text/html" not in content_type and "application/xhtml+xml" not in content_type:
                        raise ValueError("HTML 문서만 분석할 수 있습니다.")

                    chunks = bytearray()
                    async for chunk in response.aiter_bytes():
                        chunks.extend(chunk)
                        if len(chunks) > MAX_DOWNLOAD_BYTES:
                            raise ValueError("본문 크기가 너무 커서 분석을 중단했습니다.")

                    encoding = response.encoding or "utf-8"
                    return chunks.decode(encoding, errors="ignore"), str(response.url)
            except httpx.HTTPStatusError as exc:
                raise ValueError(f"대상 페이지를 불러오지 못했습니다. (HTTP {exc.response.status_code})") from exc
            except httpx.RequestError as exc:
                raise ValueError("대상 페이지에 연결하지 못했습니다.") from exc

    raise ValueError("리다이렉트가 너무 많아 분석을 중단했습니다.")


def _clean_text(text: str) -> str:
    cleaned = re.sub(r"\s+", " ", text or "").strip()
    cleaned = re.sub(r"[\w.+-]+@[\w-]+\.[\w.-]+", "[이메일 숨김]", cleaned)
    cleaned = re.sub(r"(?<!\d)(01[0-9]-?\d{3,4}-?\d{4})(?!\d)", "[전화번호 숨김]", cleaned)
    cleaned = re.sub(r"(?<!\d)\d{10,16}(?!\d)", "[주문번호 숨김]", cleaned)
    return cleaned


def _meta_content(soup: BeautifulSoup, *, name: str | None = None, prop: str | None = None) -> str:
    tag = None
    if name:
        tag = soup.find("meta", attrs={"name": name})
    if not tag and prop:
        tag = soup.find("meta", property=prop)
    return _clean_text(tag.get("content", "")) if tag else ""


def _parse_html(html: str, url: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")

    for tag in soup(["script", "style", "noscript", "iframe", "svg", "canvas", "form"]):
        tag.decompose()

    title = (
        _clean_text(soup.title.string)
        if soup.title and soup.title.string
        else _meta_content(soup, prop="og:title")
        or url
    )
    author = _meta_content(soup, name="author") or _meta_content(soup, prop="article:author")
    meta_description = _meta_content(soup, name="description") or _meta_content(soup, prop="og:description")

    root = (
        soup.find("article")
        or soup.find("main")
        or soup.find(attrs={"role": "main"})
        or soup.body
        or soup
    )

    blocks: list[str] = []
    for element in root.find_all(["h2", "h3", "p", "li", "blockquote"]):
        text = _clean_text(element.get_text(" ", strip=True))
        if len(text) >= 35:
            blocks.append(text)

    if not blocks:
        fallback = _clean_text(root.get_text(" ", strip=True))
        if fallback:
            blocks.append(fallback)

    snippet = " ".join(blocks)[:3000]
    if not snippet:
        snippet = meta_description[:3000]

    media_types = ["text"]
    if root.find("img"):
        media_types.append("image")
    if root.find(["video", "iframe"]):
        media_types.append("video")

    return {
        "title": title[:500],
        "author": author[:200],
        "snippet": snippet,
        "meta_description": meta_description[:500],
        "media_types": list(dict.fromkeys(media_types)),
    }
