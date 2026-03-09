import { type SourceResult } from "@/lib/api";

export interface SignalGroups {
  positive: string[];
  caution: string[];
  insufficient: string[];
}

const POSITIVE_KEYWORDS = [
  "실사용",
  "직접",
  "비교",
  "단점",
  "장점",
  "구체",
  "수치",
  "기간",
  "사진",
  "영상",
  "후기",
  "경험",
  "반복",
];

const CAUTION_KEYWORDS = [
  "광고",
  "협찬",
  "제휴",
  "홍보",
  "링크",
  "과다",
  "과장",
  "할인코드",
  "쿠폰",
  "반복 문구",
  "판촉",
];

const INSUFFICIENT_KEYWORDS = [
  "부족",
  "적음",
  "적습니다",
  "없음",
  "없습니다",
  "드뭄",
  "드뭅니다",
  "확인 어려움",
  "확인 어렵",
  "제한",
  "미표시",
];

export function buildResultSignalGroups(
  result: Pick<SourceResult, "explanations" | "author_name" | "published_at" | "snippet" | "engagement">,
): SignalGroups {
  const groups = groupExplanationSignals(result.explanations);
  const hasEngagement = Boolean(
    result.engagement?.likes || result.engagement?.comments || result.engagement?.views,
  );

  const fallbackGroups: SignalGroups = {
    positive: [],
    caution: [],
    insufficient: [],
  };

  if (result.author_name) {
    fallbackGroups.positive.push("작성자 정보가 함께 제공됩니다");
  } else {
    fallbackGroups.insufficient.push("작성자 정보가 비어 있습니다");
  }

  if (result.published_at) {
    fallbackGroups.positive.push("작성 시점을 함께 확인할 수 있습니다");
  } else {
    fallbackGroups.insufficient.push("작성 시점 정보가 부족합니다");
  }

  if (result.snippet) {
    fallbackGroups.positive.push("원문 일부를 요약해 카드에서 바로 읽을 수 있습니다");
  } else {
    fallbackGroups.insufficient.push("본문 요약 정보가 충분하지 않습니다");
  }

  if (!hasEngagement) {
    fallbackGroups.insufficient.push("반응 지표가 충분히 제공되지 않았습니다");
  }

  return ensureMinimumSignals(groups, fallbackGroups);
}

function groupExplanationSignals(explanations?: string[]): SignalGroups {
  const groups: SignalGroups = {
    positive: [],
    caution: [],
    insufficient: [],
  };

  for (const raw of explanations || []) {
    const cleaned = cleanSignalText(raw);
    if (!cleaned) {
      continue;
    }

    const bucket = getSignalBucket(raw, cleaned);
    if (!groups[bucket].includes(cleaned)) {
      groups[bucket].push(cleaned);
    }
  }

  return groups;
}

function ensureMinimumSignals(base: SignalGroups, fallback: SignalGroups): SignalGroups {
  const merged: SignalGroups = {
    positive: [...base.positive],
    caution: [...base.caution],
    insufficient: [...base.insufficient],
  };

  const bucketOrder: Array<keyof SignalGroups> = ["positive", "caution", "insufficient"];

  for (const bucket of bucketOrder) {
    for (const item of fallback[bucket]) {
      if (countSignals(merged) >= 3) {
        return merged;
      }

      if (!merged[bucket].includes(item)) {
        merged[bucket].push(item);
      }
    }
  }

  return merged;
}

function countSignals(groups: SignalGroups) {
  return groups.positive.length + groups.caution.length + groups.insufficient.length;
}

function getSignalBucket(raw: string, cleaned: string): keyof SignalGroups {
  const normalized = cleaned.toLocaleLowerCase("ko-KR");
  const trimmed = raw.trim();

  if (trimmed.startsWith("+")) {
    return "positive";
  }

  if (trimmed.startsWith("-")) {
    return "caution";
  }

  if (matchesAny(normalized, INSUFFICIENT_KEYWORDS)) {
    return "insufficient";
  }

  if (matchesAny(normalized, CAUTION_KEYWORDS)) {
    return "caution";
  }

  if (matchesAny(normalized, POSITIVE_KEYWORDS)) {
    return "positive";
  }

  return "insufficient";
}

function cleanSignalText(value: string) {
  return value.replace(/^[+\-•]\s*/, "").trim();
}

function matchesAny(value: string, candidates: string[]) {
  return candidates.some((candidate) => value.includes(candidate.toLocaleLowerCase("ko-KR")));
}
