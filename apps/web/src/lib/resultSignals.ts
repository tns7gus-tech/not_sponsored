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
  "장점",
  "단점",
  "구체",
  "수치",
  "기간",
  "사진",
  "영상",
  "후기",
  "경험",
];

const CAUTION_KEYWORDS = [
  "광고",
  "제공",
  "제휴",
  "홍보",
  "링크",
  "과도",
  "과장",
  "할인코드",
  "쿠폰",
  "유도",
];

const INSUFFICIENT_KEYWORDS = [
  "부족",
  "없음",
  "제한",
  "확인 어려움",
  "미표기",
  "미노출",
];

export function buildResultSignalGroups(
  result: Pick<SourceResult, "explanations" | "author_name" | "published_at" | "snippet" | "engagement">,
): SignalGroups {
  const groups = groupExplanationSignals(result.explanations);
  const fallbackGroups: SignalGroups = {
    positive: [],
    caution: [],
    insufficient: [],
  };

  if (result.author_name) {
    fallbackGroups.positive.push("작성자 정보가 함께 제공됩니다.");
  } else {
    fallbackGroups.insufficient.push("작성자 정보가 비어 있습니다.");
  }

  if (result.published_at) {
    fallbackGroups.positive.push("게시 시점을 확인할 수 있습니다.");
  } else {
    fallbackGroups.insufficient.push("게시 시점 정보가 부족합니다.");
  }

  if (result.snippet) {
    fallbackGroups.positive.push("본문 일부를 카드에서 바로 확인할 수 있습니다.");
  } else {
    fallbackGroups.insufficient.push("본문 요약 정보가 충분하지 않습니다.");
  }

  if (!result.engagement?.likes && !result.engagement?.comments && !result.engagement?.views) {
    fallbackGroups.insufficient.push("반응 데이터가 충분히 제공되지 않습니다.");
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

  for (const bucket of ["positive", "caution", "insufficient"] as const) {
    for (const item of fallback[bucket]) {
      if (countSignals(merged) >= 4) {
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

  if (matchesAny(normalized, CAUTION_KEYWORDS)) {
    return "caution";
  }

  if (matchesAny(normalized, POSITIVE_KEYWORDS)) {
    return "positive";
  }

  if (matchesAny(normalized, INSUFFICIENT_KEYWORDS)) {
    return "insufficient";
  }

  return "insufficient";
}

function cleanSignalText(value: string) {
  return value.replace(/^[+\-\s•]+/, "").trim();
}

function matchesAny(value: string, candidates: string[]) {
  return candidates.some((candidate) => value.includes(candidate.toLocaleLowerCase("ko-KR")));
}
