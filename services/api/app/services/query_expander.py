from __future__ import annotations
"""
질의 확장 엔진 - 사용자 입력을 카테고리별 하위 질의로 확장

PRD 섹션 9.3, 15.3 기반 구현
"""
import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)

# === 기본 확장 키워드 (모든 카테고리 공통) ===
BASE_SUFFIXES_KO = [
    "후기", "리뷰", "내돈내산", "실사용", "장점", "단점", "비교", "추천",
]

BASE_SUFFIXES_EN = [
    "review", "honest review", "pros cons",
]

# === 카테고리별 확장 키워드 사전 ===
CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "electronics": ["배터리", "발열", "성능", "카메라", "AS", "초기불량", "스펙"],
    "cosmetics": ["피부타입", "트러블", "향", "흡수력", "재구매", "성분", "민감성"],
    "fashion": ["착화감", "사이즈", "발볼", "내구성", "실물색감", "코디", "오염"],
    "food": ["맛", "재구매", "배송상태", "유통기한", "포장", "알레르기", "성분"],
    "general": ["가성비", "추천하지 않는 이유", "환불", "교환"],
}

# === 카테고리 감지용 키워드 매핑 ===
CATEGORY_DETECTION: dict[str, list[str]] = {
    "electronics": [
        "아이폰", "iphone", "갤럭시", "galaxy", "노트북", "맥북", "macbook",
        "에어팟", "airpods", "태블릿", "아이패드", "ipad", "워치", "watch",
        "폰", "phone", "이어폰", "스피커", "모니터", "키보드", "마우스",
        "카메라", "tv", "에어프라이어", "로봇청소기", "건조기", "세탁기",
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
}


def detect_category(query: str) -> str:
    """검색어에서 제품 카테고리를 추정"""
    query_lower = query.lower()
    for category, keywords in CATEGORY_DETECTION.items():
        for kw in keywords:
            if kw in query_lower:
                return category
    return "general"


def normalize_query(query: str) -> str:
    """검색어 정규화 - 공백 정리, 특수문자 제거"""
    # 앞뒤 공백 제거
    query = query.strip()
    # 연속 공백을 하나로
    query = re.sub(r"\s+", " ", query)
    return query


def extract_english_name(query: str) -> Optional[str]:
    """한글 제품명에서 영문명 추출 시도 (간단한 매핑)"""
    # 간단한 한영 매핑 (향후 확장 가능)
    mappings = {
        "아이폰": "iPhone",
        "갤럭시": "Galaxy",
        "맥북": "MacBook",
        "에어팟": "AirPods",
        "아이패드": "iPad",
        "나이키": "Nike",
        "아디다스": "Adidas",
        "뉴발란스": "New Balance",
    }
    for ko, en in mappings.items():
        if ko in query:
            return query.replace(ko, en)
    return None


def expand_queries(raw_query: str) -> dict:
    """
    사용자 입력을 다중 질의로 확장

    Returns:
        {
            "normalized_query": str,
            "category": str,
            "expanded_queries": list[str],
            "source_plan": dict
        }
    """
    normalized = normalize_query(raw_query)
    category = detect_category(normalized)
    logger.info(f"질의 확장 시작: '{normalized}' (카테고리: {category})")

    queries = []

    # 1) 기본 한글 확장
    for suffix in BASE_SUFFIXES_KO:
        queries.append(f"{normalized} {suffix}")

    # 2) 카테고리별 확장
    cat_keywords = CATEGORY_KEYWORDS.get(category, CATEGORY_KEYWORDS["general"])
    for kw in cat_keywords[:5]:  # 상위 5개만 사용
        queries.append(f"{normalized} {kw}")

    # 3) 영문 확장
    en_name = extract_english_name(normalized)
    if en_name:
        for suffix in BASE_SUFFIXES_EN:
            queries.append(f"{en_name} {suffix}")
    else:
        # 원문 그대로 영문 서픽스 추가
        for suffix in BASE_SUFFIXES_EN:
            queries.append(f"{normalized} {suffix}")

    # 중복 제거
    seen = set()
    unique_queries = []
    for q in queries:
        if q not in seen:
            seen.add(q)
            unique_queries.append(q)

    # 소스 플랜 생성
    source_plan = {
        "naver_blog": unique_queries[:6],
        "naver_cafe": unique_queries[:4],
        "naver_news": [normalized, f"{normalized} 리뷰", f"{normalized} 이슈"],
        "naver_shopping": [normalized],
        "youtube": unique_queries[:5],
    }

    logger.info(f"질의 확장 완료: {len(unique_queries)}개 생성")

    return {
        "normalized_query": normalized,
        "category": category,
        "expanded_queries": unique_queries,
        "source_plan": source_plan,
    }
