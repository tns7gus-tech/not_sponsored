"""
YouTube Data API connector.

YouTube 검색 결과를 수집한다.
Ref: https://developers.google.com/youtube/v3/docs/search/list
"""

import asyncio
import logging

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"

MOCK_RESULTS = [
    {
        "id": {"videoId": "mock_video_001"},
        "snippet": {
            "title": "아이폰 17 리뷰 - 2주 사용 장단점 총정리",
            "description": "아이폰 17을 2주간 사용해봤습니다. 배터리, 카메라, 발열까지 솔직하게 리뷰합니다.",
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
            "title": "아이폰 17 vs 갤럭시 S26 비교 리뷰 | 어떤 걸 사야 할까?",
            "description": "아이폰 17과 갤럭시 S26을 직접 비교해봤습니다. 카메라, 성능, 배터리, 사용자 경험을 모두 비교합니다.",
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
            "title": "[내돈내산] 아이폰 17 한 달 사용기 - 이건 좋고 이건 아쉽다",
            "description": "내돈내산으로 한 달 사용한 솔직 후기입니다. 장점도 많지만 단점도 분명히 있습니다.",
            "channelTitle": "솔직리뷰룸",
            "publishedAt": "2026-02-25T09:00:00Z",
            "thumbnails": {
                "medium": {"url": "https://i.ytimg.com/vi/mock003/mqdefault.jpg"}
            },
        },
    },
]


def _has_api_key() -> bool:
    return bool(settings.YOUTUBE_API_KEY)


async def search_youtube(queries: list[str], max_results: int = 5) -> list[dict]:
    if not _has_api_key():
        logger.warning("YouTube API 키 미설정 - Mock 데이터 사용")
        return _normalize_youtube_results(MOCK_RESULTS)

    async def _fetch_one(client: httpx.AsyncClient, query: str) -> list[dict]:
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
            items = response.json().get("items", [])
            logger.info("YouTube '%s': %s건 수집", query, len(items))
            return items
        except httpx.HTTPStatusError as exc:
            logger.error("YouTube API 오류 ('%s'): %s", query, exc.response.status_code)
            return []
        except httpx.RequestError as exc:
            logger.error("YouTube 요청 실패 ('%s'): %s", query, exc)
            return []

    async with httpx.AsyncClient(timeout=10.0) as client:
        results = await asyncio.gather(*[_fetch_one(client, q) for q in queries])

    all_items = [item for batch in results for item in batch]
    return _normalize_youtube_results(all_items)


def _normalize_youtube_results(items: list[dict]) -> list[dict]:
    normalized = []
    seen_ids = set()

    for item in items:
        video_id = item.get("id", {}).get("videoId", "")
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
