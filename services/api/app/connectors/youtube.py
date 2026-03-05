"""
YouTube Data API 커넥터

YouTube 검색 결과 수집
Ref: https://developers.google.com/youtube/v3/docs/search/list
"""
import logging
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"

# Mock 데이터 (API 키 없을 때 사용)
MOCK_RESULTS = [
    {
        "id": {"videoId": "mock_video_001"},
        "snippet": {
            "title": "아이폰17 리뷰 - 2주 사용 장단점 총정리",
            "description": "아이폰17을 2주간 사용해봤습니다. 배터리, 카메라, 발열 등 솔직하게 리뷰합니다.",
            "channelTitle": "테크리뷰TV",
            "publishedAt": "2026-03-01T10:00:00Z",
            "thumbnails": {
                "medium": {"url": "https://i.ytimg.com/vi/mock001/mqdefault.jpg"}
            },
        },
    },
    {
        "id": {"videoId": "mock_video_002"},
        "snippet": {
            "title": "아이폰17 vs 갤럭시 S26 비교 리뷰 | 어떤 걸 사야할까?",
            "description": "아이폰17과 갤럭시 S26을 직접 비교해봤습니다. 카메라, 성능, 배터리, 디자인 모두 비교!",
            "channelTitle": "모바일기기연구소",
            "publishedAt": "2026-02-28T14:00:00Z",
            "thumbnails": {
                "medium": {"url": "https://i.ytimg.com/vi/mock002/mqdefault.jpg"}
            },
        },
    },
    {
        "id": {"videoId": "mock_video_003"},
        "snippet": {
            "title": "[내돈내산] 아이폰17 한 달 사용기 - 이건 꼭 알고 사세요",
            "description": "내돈내산으로 한 달 사용한 솔직 후기. 장점도 많지만 단점도 분명히 있습니다.",
            "channelTitle": "솔직리뷰어",
            "publishedAt": "2026-02-25T09:00:00Z",
            "thumbnails": {
                "medium": {"url": "https://i.ytimg.com/vi/mock003/mqdefault.jpg"}
            },
        },
    },
]


def _has_api_key() -> bool:
    """API 키 설정 여부 확인"""
    return bool(settings.YOUTUBE_API_KEY)


async def search_youtube(queries: list[str], max_results: int = 5) -> list[dict]:
    """
    YouTube 검색 API 호출

    Args:
        queries: 검색 질의 리스트
        max_results: 질의당 최대 결과 수

    Returns:
        정규화된 결과 리스트
    """
    # API 키가 없으면 Mock 데이터 반환
    if not _has_api_key():
        logger.warning("YouTube API 키 미설정 - Mock 데이터 사용")
        return _normalize_youtube_results(MOCK_RESULTS)

    all_items = []

    async with httpx.AsyncClient(timeout=10.0) as client:
        for query in queries:
            try:
                response = await client.get(
                    YOUTUBE_SEARCH_URL,
                    params={
                        "part": "snippet",
                        "q": query,
                        "type": "video",
                        "maxResults": max_results,
                        "order": "relevance",
                        "key": settings.YOUTUBE_API_KEY,
                        "relevanceLanguage": "ko",
                    },
                )
                response.raise_for_status()
                data = response.json()
                items = data.get("items", [])
                all_items.extend(items)
                logger.info(f"YouTube '{query}': {len(items)}건 수집")
            except httpx.HTTPStatusError as e:
                logger.error(f"YouTube API 에러 ('{query}'): {e.response.status_code}")
            except httpx.RequestError as e:
                logger.error(f"YouTube 요청 실패 ('{query}'): {e}")

    return _normalize_youtube_results(all_items)


def _normalize_youtube_results(items: list[dict]) -> list[dict]:
    """YouTube 결과를 공통 스키마로 정규화"""
    normalized = []
    seen_ids = set()

    for item in items:
        video_id = item.get("id", {}).get("videoId", "")
        # 중복 영상 제거
        if video_id in seen_ids:
            continue
        seen_ids.add(video_id)

        snippet = item.get("snippet", {})
        result = {
            "platform": "youtube",
            "url": f"https://www.youtube.com/watch?v={video_id}" if video_id else "",
            "title": snippet.get("title", ""),
            "author_name": snippet.get("channelTitle", ""),
            "published_at": snippet.get("publishedAt", ""),
            "snippet": snippet.get("description", ""),
            "media_types": ["video"],
            "engagement_json": {
                "thumbnail": snippet.get("thumbnails", {}).get("medium", {}).get("url", ""),
            },
            "raw_payload_json": item,
        }
        normalized.append(result)

    return normalized
