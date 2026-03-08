import logging
from typing import Any, Dict, Iterable

from app.services.signal_extractor import GROUP_AD, GROUP_REAL_USAGE

logger = logging.getLogger(__name__)

HIGH_TRUST_REAL_USAGE_TYPES = {
    "REAL_OWNED",
    "REAL_DURATION",
    "REAL_VISIT",
    "REAL_DRAWBACK",
}


def _get_signal_value(signal: Any, key: str, default: Any = None) -> Any:
    if isinstance(signal, dict):
        return signal.get(key, default)
    return getattr(signal, key, default)


def calculate_scores(signals: Iterable[Any]) -> Dict[str, Any]:
    crs = 100
    eqs = 0
    trust_boost = 0
    explanations: list[str] = []

    for signal in signals:
        signal_type = _get_signal_value(signal, "signal_type")
        signal_group = _get_signal_value(signal, "signal_group")
        confidence = float(_get_signal_value(signal, "confidence", 0) or 0)
        matched_text = _get_signal_value(signal, "matched_text", "")

        if signal_group == GROUP_AD:
            penalty = int(42 * confidence)
            crs -= penalty
            explanations.append(f"광고/협찬 가능성 신호: '{matched_text}' (-{penalty})")
            continue

        if signal_group == GROUP_REAL_USAGE:
            bonus = int(28 * confidence)
            eqs += bonus
            explanations.append(f"실사용 정황 신호: '{matched_text}' (+{bonus})")

            if signal_type in HIGH_TRUST_REAL_USAGE_TYPES:
                boost = int(10 * confidence)
                trust_boost += boost
                explanations.append(f"일반인 실사용 우선 신호 강화: '{matched_text}' (+{boost})")

    crs = max(0, min(100, crs))
    eqs = max(0, min(100, eqs))
    tss = int((crs * 0.52) + (eqs * 0.38) + trust_boost)
    tss = max(0, min(100, tss))

    if crs < 45:
        tier = "F"
    elif tss >= 85:
        tier = "S"
    elif tss >= 68:
        tier = "A"
    elif tss >= 48:
        tier = "B"
    else:
        tier = "C"

    if crs == 100 and eqs == 0:
        explanations.append("광고 신호도, 실사용 신호도 뚜렷하지 않은 중립 결과입니다.")

    return {
        "crs": crs,
        "eqs": eqs,
        "tss": tss,
        "tier": tier,
        "explanation": explanations,
    }
