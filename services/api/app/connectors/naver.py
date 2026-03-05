from __future__ import annotations
"""
NAVER Search API 커넥터

NAVER 검색 API (블로그, 카페, 뉴스, 쇼핑) 결과 수집
Ref: https://developers.naver.com/docs/serviceapi/search/blog/blog.md
"""
import logging
import httpx
from typing import Optional
from app.config import settings

logger = logging.getLogger(__name__)

NAVER_API_BASE = "https://openapi.naver.com/v1/search"

# 소스별 API 엔드포인트 매핑
NAVER_ENDPOINTS = {
    "naver_blog": f"{NAVER_API_BASE}/blog.json",
    "naver_cafe": f"{NAVER_API_BASE}/cafearticle.json",
    "naver_news": f"{NAVER_API_BASE}/news.json",
    "naver_shopping": f"{NAVER_API_BASE}/shop.json",
}

# Mock 데이터 (API 키 없을 때 사용)
MOCK_RESULTS = {
    "naver_blog": [
        {
            "title": "<b>아이폰17</b> 2주 실사용 후기 - 배터리와 카메라 솔직 리뷰",
            "link": "https://blog.naver.com/example1/123456",
            "description": "2주 정도 써봤는데 배터리는 확실히 이전 모델보다 좋아졌어요. 카메라도 야간 촬영이 많이 개선됐습니다. 다만 발열이 좀...",
            "bloggername": "테크리뷰어김",
            "postdate": "20260301",
        },
        {
            "title": "<b>아이폰17</b> 내돈내산 3주 사용기 - 장단점 총정리",
            "link": "https://blog.naver.com/example2/789012",
            "description": "내돈내산으로 구매해서 3주째 사용 중입니다. 장점은 디자인, 카메라, 배터리. 단점은 가격, 발열, 케이스 호환성입니다.",
            "bloggername": "일상기록러",
            "postdate": "20260228",
        },
    ],
    "naver_cafe": [
        {
            "title": "<b>아이폰17</b> 구매 후기 공유합니다",
            "link": "https://cafe.naver.com/example/111",
            "description": "어제 아이폰17 받았습니다. 초기 세팅하면서 느낀 점 공유해요. 전반적으로 만족스럽지만 가격이...",
            "cafename": "IT기기 사용자 모임",
            "cafeurl": "https://cafe.naver.com/example",
        },
    ],
    "naver_news": [
        {
            "title": "아이폰17 출시 첫 주 판매량 역대 최고... 사용자 반응은?",
            "link": "https://news.naver.com/article/123/456",
            "description": "애플의 아이폰17이 출시 첫 주 판매량 역대 최고를 기록했다. 사용자들은 카메라 성능과 배터리에 만족하면서도 발열 문제를 지적하고 있다.",
            "originallink": "https://example-news.com/article/789",
            "pubDate": "Mon, 01 Mar 2026 09:00:00 +0900",
        },
    ],
    "naver_shopping": [
        {
            "title": "Apple <b>아이폰17</b> 256GB",
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
    """NAVER API 인증 헤더 생성"""
    return {
        "X-Naver-Client-Id": settings.NAVER_CLIENT_ID,
        "X-Naver-Client-Secret": settings.NAVER_CLIENT_SECRET,
    }


def _has_api_key() -> bool:
    """API 키 설정 여부 확인"""
    return bool(settings.NAVER_CLIENT_ID and settings.NAVER_CLIENT_SECRET)


async def search_naver(
    source_type: str,
    queries: list[str],
    display: int = 10,
) -> list[dict]:
    """
    NAVER 검색 API 호출

    Args:
        source_type: 소스 타입 (naver_blog, naver_cafe, naver_news, naver_shopping)
        queries: 검색 질의 리스트
        display: 결과 수 (기본 10)

    Returns:
        정규화된 결과 리스트
    """
    # API 키가 없으면 Mock 데이터 반환
    if not _has_api_key():
        logger.warning(f"NAVER API 키 미설정 - Mock 데이터 사용 ({source_type})")
        return _normalize_naver_results(
            source_type,
            MOCK_RESULTS.get(source_type, []),
        )

    endpoint = NAVER_ENDPOINTS.get(source_type)
    if not endpoint:
        logger.error(f"알 수 없는 NAVER 소스 타입: {source_type}")
        return []

    all_results = []
    headers = _get_headers()

    async with httpx.AsyncClient(timeout=10.0) as client:
        for query in queries:
            try:
                response = await client.get(
                    endpoint,
                    headers=headers,
                    params={
                        "query": query,
                        "display": display,
                        "sort": "sim",  # 정확도순
                    },
                )
                response.raise_for_status()
                data = response.json()
                items = data.get("items", [])
                all_results.extend(items)
                logger.info(f"NAVER {source_type} '{query}': {len(items)}건 수집")
            except httpx.HTTPStatusError as e:
                logger.error(f"NAVER API 에러 ({source_type}, '{query}'): {e.response.status_code}")
            except httpx.RequestError as e:
                logger.error(f"NAVER 요청 실패 ({source_type}, '{query}'): {e}")

    return _normalize_naver_results(source_type, all_results)


def _normalize_naver_results(source_type: str, items: list[dict]) -> list[dict]:
    """NAVER 결과를 공통 스키마로 정규화"""
    normalized = []
    for item in items:
        # HTML 태그 제거
        title = _strip_html(item.get("title", ""))
        snippet = _strip_html(item.get("description", ""))

        result = {
            "platform": source_type,
            "url": item.get("link", ""),
            "title": title,
            "snippet": snippet,
            "media_types": ["text"],
        }

        # 소스별 추가 필드 매핑
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
    """간단한 HTML 태그 제거"""
    import re
    return re.sub(r"<[^>]+>", "", text)


def _format_naver_date(date_str: str) -> Optional[str]:
    """NAVER 날짜 형식(YYYYMMDD) → ISO 형식 변환"""
    if len(date_str) == 8:
        return f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:]}"
    return date_str
