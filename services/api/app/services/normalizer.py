"""
결과 정규화 모듈 - URL 기반 중복 제거 + 공통 스키마 매핑
"""
import logging

logger = logging.getLogger(__name__)


def deduplicate_results(results: list[dict]) -> list[dict]:
    """URL 기반 중복 제거"""
    seen_urls = set()
    unique = []
    for r in results:
        url = r.get("url", "")
        canonical = r.get("canonical_url", url)

        # URL이나 canonical URL로 중복 체크
        key = canonical or url
        if key and key not in seen_urls:
            seen_urls.add(key)
            unique.append(r)

    removed = len(results) - len(unique)
    if removed > 0:
        logger.info(f"중복 제거: {removed}건 제거, {len(unique)}건 남음")

    return unique


def sort_results(results: list[dict]) -> list[dict]:
    """결과 정렬 - 현재는 플랫폼 다양성 기준으로 인터리빙"""
    # 플랫폼별로 그룹화
    by_platform: dict[str, list[dict]] = {}
    for r in results:
        platform = r.get("platform", "unknown")
        if platform not in by_platform:
            by_platform[platform] = []
        by_platform[platform].append(r)

    # 라운드로빈 인터리빙 (다양한 플랫폼 결과가 번갈아 나오도록)
    sorted_results = []
    platform_lists = list(by_platform.values())
    max_len = max(len(lst) for lst in platform_lists) if platform_lists else 0

    for i in range(max_len):
        for lst in platform_lists:
            if i < len(lst):
                sorted_results.append(lst[i])

    return sorted_results


def build_summary(results: list[dict]) -> dict:
    """결과 요약 정보 생성 (Sprint 1 기본 버전)"""
    platforms = list(set(r.get("platform", "") for r in results))
    return {
        "total_results": len(results),
        "platforms": platforms,
    }

def build_summary_from_models(results: list) -> dict:
    """결과 요약 정보 생성 (Sprint 2: 신뢰도 및 신호 기반)"""
    if not results:
        return {"total_results": 0, "platforms": [], "tier_distribution": {}, "pros": [], "cons": [], "overall_status": "UNKNOWN"}

    platforms = list(set(r.platform for r in results))
    total_results = len(results)
    
    tier_distribution = {"S": 0, "A": 0, "B": 0, "C": 0, "F": 0}
    pros = []
    cons = []
    
    for r in results:
        if r.tier in tier_distribution:
            tier_distribution[r.tier] += 1
            
        for sig in r.extracted_signals:
            if sig.signal_type == "REAL_DRAWBACK":
                cons.append(f"단점 리포트: '{sig.matched_text}' ({r.platform})")
            elif sig.signal_group == "REAL_USAGE":
                pros.append(f"실사용 인증: '{sig.matched_text}' ({r.platform})")

    # 중복 제거 및 최대 3개 매핑
    unique_cons = list(dict.fromkeys(cons))[:3]
    unique_pros = list(dict.fromkeys(pros))[:3]
    
    high_trust_count = tier_distribution.get("S", 0) + tier_distribution.get("A", 0)
    ad_count = tier_distribution.get("F", 0)
    
    if ad_count > (total_results * 0.5):
        overall = "AD_DENSE"
    elif high_trust_count >= (total_results * 0.3):
        overall = "HIGH_TRUST"
    else:
        overall = "CAUTION"

    return {
        "total_results": total_results,
        "platforms": platforms,
        "tier_distribution": tier_distribution,
        "pros": unique_pros,
        "cons": unique_cons,
        "overall_status": overall
    }
