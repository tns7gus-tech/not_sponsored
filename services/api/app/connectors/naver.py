from __future__ import annotations

"""
NAVER Search API connector.

NAVER 검색 API (블로그, 카페, 뉴스, 쇼핑) 결과를 수집한다.
Ref: https://developers.naver.com/docs/serviceapi/search/blog/blog.md
"""

import asyncio
import logging
from typing import Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

NAVER_API_BASE = "https://openapi.naver.com/v1/search"

NAVER_ENDPOINTS = {
    "naver_blog": f"{NAVER_API_BASE}/blog.json",
    "naver_cafe": f"{NAVER_API_BASE}/cafearticle.json",
    "naver_news": f"{NAVER_API_BASE}/news.json",
    "naver_shopping": f"{NAVER_API_BASE}/shop.json",
}

MOCK_RESULTS = {
    "naver_blog": [
        {
            "title": "<b>아이폰 17</b> 2주 실사용 후기 - 배터리와 카메라 중심 리뷰",
            "link": "https://blog.naver.com/example1/123456",
            "description": "2주 정도 써보니 배터리는 확실히 좋아졌고 카메라도 야간 촬영이 많이 개선됐습니다. 다만 발열은 여전히 아쉬웠습니다.",
            "bloggername": "테크리뷰노트",
            "postdate": "20260301",
        },
        {
            "title": "<b>아이폰 17</b> 내돈내산 3주 사용기 - 장단점 총정리",
            "link": "https://blog.naver.com/example2/789012",
            "description": "내돈내산으로 구매해서 3주째 쓰는 중입니다. 장점은 디자인과 카메라, 배터리이고 단점은 가격과 발열, 케이스 호환성입니다.",
            "bloggername": "일상기록장",
            "postdate": "20260228",
        },
    ],
    "naver_cafe": [
        {
            "title": "<b>아이폰 17</b> 구매 후기 공유합니다",
            "link": "https://cafe.naver.com/example/111",
            "description": "이제 아이폰 17 받았습니다. 초기 세팅하면서 느낀 점 몇 개 공유해요. 전반적으로 만족스럽지만 가격은 확실히 부담됩니다.",
            "cafename": "IT기기 사용자 모임",
            "cafeurl": "https://cafe.naver.com/example",
        },
    ],
    "naver_news": [
        {
            "title": "아이폰 17 출시 첫 주 판매량 최고... 사용자 반응은?",
            "link": "https://news.naver.com/article/123/456",
            "description": "애플의 아이폰 17이 출시 첫 주 판매량 신기록을 세웠다. 사용자들은 카메라 성능과 배터리에 만족하면서도 발열 문제를 지적하고 있다.",
            "originallink": "https://example-news.com/article/789",
            "pubDate": "Mon, 01 Mar 2026 09:00:00 +0900",
        },
    ],
    "naver_shopping": [
        {
            "title": "Apple <b>아이폰 17</b> 256GB",
            "link": "https://search.shopping.naver.com/product/123",
            "lprice": "1350000",
            "hprice": "1490000",
            "mallName": "Apple Store",
            "productId": "12345",
            "productType": "1",
            "category1": "디지털/가전",
            "category2": "휴대폰",
        },
    ],
}


def _get_headers() -> dict:
    return {
        "X-Naver-Client-Id": settings.NAVER_CLIENT_ID,
        "X-Naver-Client-Secret": settings.NAVER_CLIENT_SECRET,
    }


def _has_api_key() -> bool:
    return bool(settings.NAVER_CLIENT_ID and settings.NAVER_CLIENT_SECRET)


async def search_naver(
    source_type: str,
    queries: list[str],
    display: int = 10,
) -> list[dict]:
    if not _has_api_key():
        logger.warning("NAVER API 키 미설정 - Mock 데이터 사용 (%s)", source_type)
        return _normalize_naver_results(source_type, MOCK_RESULTS.get(source_type, []))

    endpoint = NAVER_ENDPOINTS.get(source_type)
    if not endpoint:
        logger.error("지원하지 않는 NAVER 소스 타입: %s", source_type)
        return []

    all_results = []
    headers = _get_headers()
    limited_queries = queries[:3]

    async with httpx.AsyncClient(timeout=10.0) as client:
        for i, query in enumerate(limited_queries):
            if i > 0:
                await asyncio.sleep(0.3)

            for attempt in range(3):
                try:
                    response = await client.get(
                        endpoint,
                        headers=headers,
                        params={
                            "query": query,
                            "display": display,
                            "sort": "sim",
                        },
                    )
                    if response.status_code == 429:
                        wait_time = (attempt + 1) * 0.5
                        logger.warning(
                            "NAVER 429 rate limit (%s, '%s') - %.1fs 후 재시도",
                            source_type,
                            query,
                            wait_time,
                        )
                        await asyncio.sleep(wait_time)
                        continue
                    response.raise_for_status()
                    items = response.json().get("items", [])
                    all_results.extend(items)
                    logger.info("NAVER %s '%s': %s건 수집", source_type, query, len(items))
                    break
                except httpx.HTTPStatusError as exc:
                    logger.error("NAVER API 오류 (%s, '%s'): %s", source_type, query, exc.response.status_code)
                    break
                except httpx.RequestError as exc:
                    logger.error("NAVER 요청 실패 (%s, '%s'): %s", source_type, query, exc)
                    break

    return _normalize_naver_results(source_type, all_results)


def _normalize_naver_results(source_type: str, items: list[dict]) -> list[dict]:
    normalized = []
    for item in items:
        title = _strip_html(item.get("title", ""))
        snippet = _strip_html(item.get("description", ""))

        result = {
            "platform": source_type,
            "url": item.get("link", ""),
            "title": title,
            "snippet": snippet,
            "media_types": ["text"],
        }

        if source_type == "naver_blog":
            result["author_name"] = item.get("bloggername", "")
            result["published_at"] = _format_naver_date(item.get("postdate", ""))
        elif source_type == "naver_cafe":
            result["author_name"] = item.get("cafename", "")
        elif source_type == "naver_news":
            result["published_at"] = item.get("pubDate", "")
            result["canonical_url"] = item.get("originallink", "")
        elif source_type == "naver_shopping":
            result["engagement_json"] = {
                "lprice": item.get("lprice"),
                "hprice": item.get("hprice"),
                "mall": item.get("mallName"),
            }

        result["raw_payload_json"] = item
        normalized.append(result)

    return normalized


def _strip_html(text: str) -> str:
    import re

    return re.sub(r"<[^>]+>", "", text)


def _format_naver_date(date_str: str) -> Optional[str]:
    if len(date_str) == 8:
        return f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:]}"
    return date_str
