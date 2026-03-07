"""
스코어링 엔진 (Scoring Engine).
"""

import logging
from typing import Any, Dict, Iterable

from app.services.signal_extractor import GROUP_AD, GROUP_REAL_USAGE

logger = logging.getLogger(__name__)


def _get_signal_value(signal: Any, key: str, default: Any = None) -> Any:
    if isinstance(signal, dict):
        return signal.get(key, default)
    return getattr(signal, key, default)


def calculate_scores(signals: Iterable[Any]) -> Dict[str, Any]:
    """
    추출된 신호를 기반으로 CRS, EQS, TSS를 계산한다.

    dict 형태의 신호와 ORM 객체 모두 처리한다.
    """
    crs = 100
    eqs = 0
    explanations: list[str] = []

    for signal in signals:
        signal_group = _get_signal_value(signal, "signal_group")
        confidence = float(_get_signal_value(signal, "confidence", 0) or 0)
        matched_text = _get_signal_value(signal, "matched_text", "")

        if signal_group == GROUP_AD:
            penalty = int(40 * confidence)
            crs -= penalty
            explanations.append(f"광고/협찬 의심 표현 발견: '{matched_text}' (-{penalty}점)")
        elif signal_group == GROUP_REAL_USAGE:
            bonus = int(25 * confidence)
            eqs += bonus
            explanations.append(f"실사용 경험(단점/기간 등) 묘사 발견: '{matched_text}' (+{bonus}점)")

    crs = max(0, min(100, crs))
    eqs = max(0, min(100, eqs))
    tss = int((crs * 0.6) + (eqs * 0.4))

    tier = "C"
    if crs < 50:
        tier = "F"
    elif tss >= 80:
        tier = "S"
    elif tss >= 60:
        tier = "A"
    elif tss >= 40:
        tier = "B"

    if crs == 100 and eqs == 0:
        explanations.append("광고성 신호도, 뚜렷한 실사용 신호도 발견되지 않은 일반 중립 글입니다.")

    return {
        "crs": crs,
        "eqs": eqs,
        "tss": tss,
        "tier": tier,
        "explanation": explanations,
    }
