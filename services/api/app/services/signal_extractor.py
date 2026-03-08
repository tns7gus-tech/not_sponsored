import logging
import re
from typing import List, TypedDict

logger = logging.getLogger(__name__)

GROUP_AD = "AD"
GROUP_REAL_USAGE = "REAL_USAGE"

AD_PATTERNS = {
    "AD_AFFILIATE": {
        "keywords": ["제휴", "수수료", "광고", "협찬", "원고료", "제공받아", "파트너스"],
        "regex": [r"(쿠팡|파트너스).*수수료", r"협찬.*받아", r"제공받아.*작성"],
        "weight": 1.0,
    },
    "AD_PROMO_CODE": {
        "keywords": ["할인코드", "추천인", "쿠폰코드", "프로모션"],
        "regex": [r"코드\s*입력", r"할인\s*링크"],
        "weight": 0.8,
    },
    "AD_GROUP_BUY": {
        "keywords": ["공동구매", "공구", "오픈 예정", "마감 임박", "무료증정"],
        "regex": [r"공구\s*오픈", r"구매\s*링크"],
        "weight": 0.9,
    },
}

REAL_USAGE_PATTERNS = {
    "REAL_OWNED": {
        "keywords": ["내돈내산", "직접 구매", "사비로", "영수증", "재구매"],
        "regex": [r"내\s*돈\s*내\s*산", r"사비로.*구매", r"직접.*구매"],
        "weight": 1.15,
    },
    "REAL_DURATION": {
        "keywords": ["한 달 사용", "2주 사용", "3주 사용", "실사용", "사용기", "며칠 써보니"],
        "regex": [r"[0-9]+\s*(일|주|개월|달)\s*(사용|써본|후기)", r"(한달|두달|보름)\s*(사용|써본)"],
        "weight": 0.95,
    },
    "REAL_DRAWBACK": {
        "keywords": ["단점", "아쉬운 점", "불편", "별로", "불만", "재방문 의사 없음"],
        "regex": [r"단점\s*[:：]?", r"아쉬운\s*점", r"별로였"],
        "weight": 1.0,
    },
    "REAL_VISIT": {
        "keywords": ["방문 후기", "직접 방문", "다녀와서", "재방문", "웨이팅", "주차"],
        "regex": [r"직접\s*방문", r"다녀와서\s*쓴", r"재방문\s*의사"],
        "weight": 0.95,
    },
    "REAL_CASUAL_TONE": {
        "keywords": ["솔직히", "진짜", "그냥", "써보니까", "먹어보니까", "가보니까"],
        "regex": [r"(써보|먹어보|가보)니까", r"솔직히"],
        "weight": 0.55,
    },
}


class ExtractedSignalDict(TypedDict):
    signal_type: str
    signal_group: str
    confidence: float
    matched_text: str


def extract_signals(title: str, snippet: str, platform: str) -> List[ExtractedSignalDict]:
    signals: list[ExtractedSignalDict] = []
    text_to_analyze = f"{title} {snippet}".strip()
    if not text_to_analyze:
        return signals

    text_lower = text_to_analyze.lower()

    for signal_type, config in AD_PATTERNS.items():
        matched_text = _find_match(text_lower, config["keywords"], config["regex"])
        if matched_text:
            signals.append(
                {
                    "signal_type": signal_type,
                    "signal_group": GROUP_AD,
                    "confidence": config["weight"],
                    "matched_text": matched_text,
                }
            )

    for signal_type, config in REAL_USAGE_PATTERNS.items():
        matched_text = _find_match(text_lower, config["keywords"], config["regex"])
        if matched_text:
            signals.append(
                {
                    "signal_type": signal_type,
                    "signal_group": GROUP_REAL_USAGE,
                    "confidence": config["weight"],
                    "matched_text": matched_text,
                }
            )

    if platform in {"naver_blog", "naver_cafe"}:
        for signal in signals:
            if signal["signal_type"] in {"REAL_OWNED", "REAL_DURATION", "REAL_VISIT", "REAL_DRAWBACK"}:
                signal["confidence"] = round(signal["confidence"] + 0.1, 2)

    return signals


def _find_match(text: str, keywords: list[str], regex_patterns: list[str]) -> str:
    for keyword in keywords:
        if keyword.lower() in text:
            return keyword

    for pattern in regex_patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(0)

    return ""
