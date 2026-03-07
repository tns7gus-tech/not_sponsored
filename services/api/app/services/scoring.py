"""
스코어링 엔진 (Scoring Engine)
- 추출된 신호(ExtractedSignals)를 기반으로 결과 아이템의 신뢰도 점수를 산출합니다.

점수 체계 (100점 만점 기준):
1. CRS (Content Reliability Score) - 광고/협찬 배제 점수 (기본 100점, 광고 신호 발견 차감)
2. EQS (Experience Quality Score) - 실사용 경험 품질 점수 (기본 0점, 실사용 신호 발견 시 가점)
3. TSS (Total Trust Score) - 최종 신뢰도 점수 (Weighted Sum)
"""
import logging
from typing import List, Dict, Any
from app.models.search import ExtractedSignal
from app.services.signal_extractor import GROUP_AD, GROUP_REAL_USAGE

logger = logging.getLogger(__name__)


def calculate_scores(signals: List[ExtractedSignal]) -> Dict[str, Any]:
    """
    ExtractedSignal 리스트를 입력받아 CRS, EQS, TSS를 계산하고 근거(explanation)를 반환

    Returns:
        {
            "crs": int,
            "eqs": int,
            "tss": int,
            "tier": str,  # S, A, B, C, F
            "explanation": List[str]
        }
    """
    crs = 100
    eqs = 0
    explanations = []

    # 신호별 가중치 적용
    for sig in signals:
        if sig.signal_group == GROUP_AD:
            # 광고 신호 발견 시 점수 대폭 삭감
            penalty = int(40 * sig.confidence)
            crs -= penalty
            explanations.append(f"광고/협찬 의심 표현 발견: '{sig.matched_text}' (-{penalty}점)")
        
        elif sig.signal_group == GROUP_REAL_USAGE:
            # 실사용 신호 발견 시 가점 부여
            bonus = int(25 * sig.confidence)
            eqs += bonus
            explanations.append(f"실사용 경험(단점/기간 등) 묘사 발견: '{sig.matched_text}' (+{bonus}점)")

    # 범위 보정
    crs = max(0, min(100, crs))
    eqs = max(0, min(100, EQS_CAP_CALCULATOR(eqs)))  # 100점 캡

    # 가중치 합산 (CRS 60% + EQS 40%) - 실험적 수치
    tss = int((crs * 0.6) + (eqs * 0.4))

    # 등급(Tier) 판정
    tier = "C"
    if crs < 50:
        tier = "F"  # 광고성 농후
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

def EQS_CAP_CALCULATOR(eqs: int) -> int:
    return eqs if eqs <= 100 else 100
