"""
신호 추출 엔진 (Signal Extractor)
- 원문(title, snippet)과 메타데이터에서 광고성/실사용/출처 신호를 추출
"""
import logging
import re
from typing import TypedDict, List, Optional

logger = logging.getLogger(__name__)

# 신호 그룹 (상수)
GROUP_AD = "AD"
GROUP_REAL_USAGE = "REAL_USAGE"
GROUP_AUTHORITY = "AUTHORITY"

# 광고성 패턴
AD_PATTERNS = {
    "AD_AFFILIATE": {
        "keywords": ["원고료", "수수료", "수익", "협찬", "소정의", "지원받아", "제공받아", "파트너스"],
        "regex": [r"(쿠팡|알리).*수수료.*받", r"파트너스.*활동"],
        "weight": 1.0
    },
    "AD_PROMO_CODE": {
        "keywords": ["할인코드", "추천인", "쿠폰코드", "프로모션"],
        "regex": [],
        "weight": 0.8
    },
    "AD_GROUP_BUY": {
        "keywords": ["공동구매", "공구", "특가오픈", "마켓오픈", "무료증정"],
        "regex": [],
        "weight": 0.9
    }
}

# 실사용 패턴
REAL_USAGE_PATTERNS = {
    "REAL_DRAWBACK": {
        "keywords": ["단점은", "아쉬운", "불편한", "환불", "불량", "고장", "단점이", "별로"],
        "regex": [r"아쉬운\s*점", r"단점[은이].*있"],
        "weight": 1.0
    },
    "REAL_OWNED": {
        "keywords": ["내돈내산", "제가 직접", "사비로", "영수증", "직접 구매"],
        "regex": [r"내.*돈.*내.*산", r"사비[로를].*구매"],
        "weight": 0.9
    },
    "REAL_DURATION": {
        "keywords": ["한달", "일주일", "두달", "1년", "반년", "사용기", "후기"],
        "regex": [r"[0-9]+[주달년]\s*(사용|써본)", r"(한달|두달|일주일|보름)\s*(사용|써본)"],
        "weight": 0.8
    }
}

class ExtractedSignalDict(TypedDict):
    signal_type: str
    signal_group: str
    confidence: float
    matched_text: str


def extract_signals(title: str, snippet: str, platform: str) -> List[ExtractedSignalDict]:
    """텍스트에서 각종 신호를 추출"""
    signals = []
    text_to_analyze = f"{title} {snippet}".strip()

    if not text_to_analyze:
        return signals

    text_lower = text_to_analyze.lower()

    # 1. 광고 신호 체크
    for sig_type, config in AD_PATTERNS.items():
        matched = False
        matched_str = ""
        
        # 키워드 매칭
        for kw in config["keywords"]:
            if kw in text_lower:
                matched = True
                matched_str = kw
                break
        
        # 정규식 매칭
        if not matched:
            for pat in config["regex"]:
                match = re.search(pat, text_lower)
                if match:
                    matched = True
                    matched_str = match.group(0)
                    break
        
        if matched:
            signals.append({
                "signal_type": sig_type,
                "signal_group": GROUP_AD,
                "confidence": config["weight"],
                "matched_text": matched_str
            })

    # 2. 실사용 신호 체크
    for sig_type, config in REAL_USAGE_PATTERNS.items():
        matched = False
        matched_str = ""
        
        for kw in config["keywords"]:
            if kw in text_lower:
                matched = True
                matched_str = kw
                break
        
        if not matched:
            for pat in config["regex"]:
                match = re.search(pat, text_lower)
                if match:
                    matched = True
                    matched_str = match.group(0)
                    break
        
        if matched:
            signals.append({
                "signal_type": sig_type,
                "signal_group": GROUP_REAL_USAGE,
                "confidence": config["weight"],
                "matched_text": matched_str
            })

    return signals
