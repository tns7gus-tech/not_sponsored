from __future__ import annotations

import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)

TRUST_INTENT_SUFFIXES_KO = [
    "내돈내산",
    "실사용 후기",
    "실사용",
    "사용기",
    "장단점",
    "단점",
    "방문 후기",
    "솔직 후기",
]

SECONDARY_SUFFIXES_KO = [
    "후기",
    "리뷰",
    "비교",
    "추천",
]

BASE_SUFFIXES_EN = [
    "honest review",
    "real user review",
    "owner review",
    "pros cons",
]

CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "electronics": ["배터리", "발열", "성능", "카메라", "초기 불량", "AS"],
    "cosmetics": ["피부타입", "지속력", "건조함", "밀착력", "성분", "민감성"],
    "fashion": ["착화감", "사이즈", "발볼", "내구성", "소재감", "코디"],
    "food": ["맛", "재구매", "배송 상태", "유통기한", "포장", "알레르기"],
    "travel": ["재방문", "대기시간", "주차", "가족 방문", "사진과 동일", "서비스"],
    "general": ["가성비", "추천하지 않는 이유", "불편한 점", "재구매"],
}

CATEGORY_DETECTION: dict[str, list[str]] = {
    "electronics": [
        "아이폰", "iphone", "갤럭시", "galaxy", "노트북", "맥북", "macbook",
        "에어팟", "airpods", "태블릿", "아이패드", "ipad", "워치", "watch",
        "폰", "phone", "이어폰", "스피커", "모니터", "키보드", "마우스",
        "카메라", "tv", "에어프라이어", "로봇청소기", "건조기", "청소기",
    ],
    "cosmetics": [
        "파운데이션", "선크림", "세럼", "토너", "로션", "크림", "마스크팩",
        "립스틱", "쿠션", "클렌징", "화장품", "스킨케어", "향수", "컨실러",
    ],
    "fashion": [
        "신발", "운동화", "러닝화", "나이키", "아디다스", "뉴발란스",
        "자켓", "코트", "패딩", "가방", "백팩", "지갑", "시계",
    ],
    "food": [
        "식품", "간식", "커피", "차", "건강식품", "영양제", "비타민",
        "프로틴", "닭가슴살", "다이어트",
    ],
    "travel": [
        "호텔", "숙소", "펜션", "식당", "맛집", "카페", "여행", "방문", "예약",
    ],
}

ENGLISH_NAME_MAPPINGS = {
    "아이폰": "iPhone",
    "갤럭시": "Galaxy",
    "맥북": "MacBook",
    "에어팟": "AirPods",
    "아이패드": "iPad",
    "나이키": "Nike",
    "아디다스": "Adidas",
    "뉴발란스": "New Balance",
}


def detect_category(query: str) -> str:
    query_lower = query.lower()
    for category, keywords in CATEGORY_DETECTION.items():
        if any(keyword in query_lower for keyword in keywords):
            return category
    return "general"


def normalize_query(query: str) -> str:
    return re.sub(r"\s+", " ", query.strip())


def extract_english_name(query: str) -> Optional[str]:
    for korean_name, english_name in ENGLISH_NAME_MAPPINGS.items():
        if korean_name in query:
            return query.replace(korean_name, english_name)
    return None


def expand_queries(raw_query: str) -> dict:
    normalized = normalize_query(raw_query)
    category = detect_category(normalized)
    logger.info("Expanding query '%s' (category=%s)", normalized, category)

    trust_queries = [f"{normalized} {suffix}" for suffix in TRUST_INTENT_SUFFIXES_KO]
    secondary_queries = [f"{normalized} {suffix}" for suffix in SECONDARY_SUFFIXES_KO]
    category_queries = [
        f"{normalized} {keyword}"
        for keyword in CATEGORY_KEYWORDS.get(category, CATEGORY_KEYWORDS["general"])[:4]
    ]

    english_name = extract_english_name(normalized)
    english_seed = english_name or normalized
    english_queries = [f"{english_seed} {suffix}" for suffix in BASE_SUFFIXES_EN]

    expanded_queries = _dedupe_queries(
        [normalized],
        trust_queries,
        category_queries,
        secondary_queries,
        english_queries,
    )

    source_plan = {
        "naver_blog": _dedupe_queries(trust_queries, category_queries, [normalized])[:3],
        "naver_cafe": _dedupe_queries(trust_queries, category_queries, [normalized])[:3],
        "naver_news": _dedupe_queries([normalized], category_queries, secondary_queries[:1])[:2],
        "naver_shopping": [normalized],
        "youtube": _dedupe_queries(trust_queries, secondary_queries, category_queries)[:3],
    }

    return {
        "normalized_query": normalized,
        "category": category,
        "expanded_queries": expanded_queries,
        "source_plan": source_plan,
    }


def _dedupe_queries(*query_groups: list[str]) -> list[str]:
    unique_queries: list[str] = []
    seen: set[str] = set()

    for group in query_groups:
        for query in group:
            normalized = normalize_query(query)
            if not normalized:
                continue

            dedupe_key = normalized.casefold()
            if dedupe_key in seen:
                continue

            seen.add(dedupe_key)
            unique_queries.append(normalized)

    return unique_queries
