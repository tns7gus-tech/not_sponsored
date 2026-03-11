import logging

logger = logging.getLogger(__name__)

TRUST_KEYWORDS = ("내돈내산", "직접 구매", "실사용", "사용기", "방문 후기", "직접 방문")


def deduplicate_results(results: list[dict]) -> list[dict]:
    seen_urls = set()
    unique = []

    for result in results:
        url = result.get("url", "")
        canonical = result.get("canonical_url", url)
        key = canonical or url

        if key and key not in seen_urls:
            seen_urls.add(key)
            unique.append(result)

    removed = len(results) - len(unique)
    if removed > 0:
        logger.info("Removed %s duplicate results", removed)

    return unique


def sort_results(results: list[dict]) -> list[dict]:
    if not results:
        return []

    seeded_results = sorted(results, key=_trust_bias, reverse=True)

    by_platform: dict[str, list[dict]] = {}
    for result in seeded_results:
        platform = result.get("platform", "unknown")
        by_platform.setdefault(platform, []).append(result)

    sorted_results = []
    platform_lists = list(by_platform.values())
    max_len = max(len(items) for items in platform_lists) if platform_lists else 0

    for index in range(max_len):
        for items in platform_lists:
            if index < len(items):
                sorted_results.append(items[index])

    return sorted_results


def build_summary(results: list[dict]) -> dict:
    platforms = list(set(result.get("platform", "") for result in results))
    return {
        "total_results": len(results),
        "platforms": platforms,
    }


def build_summary_from_models(results: list) -> dict:
    if not results:
        return {
            "total_results": 0,
            "platforms": [],
            "platform_counts": {},
            "tier_distribution": {},
            "pros": [],
            "cons": [],
            "overall_status": "UNKNOWN",
        }

    platforms = list(set(result.platform for result in results))
    platform_counts: dict[str, int] = {}
    total_results = len(results)
    tier_distribution = {"S": 0, "A": 0, "B": 0, "C": 0, "F": 0}
    pros: list[str] = []
    cons: list[str] = []

    for result in results:
        platform_counts[result.platform] = platform_counts.get(result.platform, 0) + 1

        if result.tier in tier_distribution:
            tier_distribution[result.tier] += 1

        for signal in result.extracted_signals:
            if signal.signal_type == "REAL_DRAWBACK":
                cons.append(f"단점 언급: '{signal.matched_text}' ({result.platform})")
            elif signal.signal_group == "REAL_USAGE":
                pros.append(f"실사용 정황: '{signal.matched_text}' ({result.platform})")

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
        "platform_counts": platform_counts,
        "tier_distribution": tier_distribution,
        "pros": unique_pros,
        "cons": unique_cons,
        "overall_status": overall,
    }


def _trust_bias(result: dict) -> int:
    text = f"{result.get('title', '')} {result.get('snippet', '')}".lower()
    return sum(1 for keyword in TRUST_KEYWORDS if keyword in text)
