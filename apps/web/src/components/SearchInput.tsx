"use client";

import { useEffect, useState, type FormEvent } from "react";

import { getTrendingSearches } from "@/lib/api";

interface Props {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

const HISTORY_KEY = "not_sponsored_history";
const TRENDING_LIMIT = 6;
const ROTATING_FALLBACK_QUERIES = [
  "러닝화 추천",
  "노이즈 캔슬링 이어폰",
  "가성비 태블릿",
  "건성 피부 토너",
  "무선 청소기",
  "블랙박스 비교",
  "캠핑 의자 추천",
  "단백질 쉐이크",
  "초등학생 책가방",
  "공기청정기 필터",
  "커피머신 입문용",
  "수분크림 추천",
  "트레일 러닝화",
  "게이밍 마우스",
  "전기면도기 비교",
  "고양이 자동급식기",
  "목 어깨 마사지기",
  "홈카페 원두",
];

export default function SearchInput({ onSearch, isLoading }: Props) {
  const [query, setQuery] = useState("");
  const [trendingQueries, setTrendingQueries] = useState<string[]>([]);

  useEffect(() => {
    async function fetchTrending() {
      const apiQueries = await getTrendingSearches();
      const recentQueries = getRecentHistoryQueries();
      const fallbackQueries = buildRotatingFallbackQueries();

      setTrendingQueries(
        mergeUniqueQueries(apiQueries, recentQueries, fallbackQueries).slice(0, TRENDING_LIMIT),
      );
    }

    fetchTrending();
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      onSearch(trimmed);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative" aria-labelledby="search-form-title">
        <div className="mb-3 flex flex-col gap-1">
          <label id="search-form-title" htmlFor="search-query" className="text-sm font-medium text-slate-200">
            제품명 또는 질문
          </label>
          <p id="search-help" className="text-sm text-slate-400">
            예: `아이폰 17 배터리 후기`, `건성 피부 선크림 추천`, `무선청소기 광고성 리뷰 비교`
          </p>
        </div>

        <div className="group relative">
          <div className="absolute -inset-0.5 rounded-[26px] bg-gradient-to-r from-emerald-400/50 via-cyan-400/45 to-sky-400/40 blur opacity-40 transition duration-500 group-hover:opacity-70" />
          <div className="relative rounded-[26px] border border-white/12 bg-slate-950/90 p-2 backdrop-blur-xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                <div className="text-slate-400" aria-hidden="true">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  id="search-query"
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="무엇을 조사하고 싶은지 입력하세요"
                  aria-describedby="search-help"
                  enterKeyHint="search"
                  className="min-h-[56px] w-full bg-transparent text-base text-white outline-none placeholder:text-slate-500 sm:text-lg"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={!query.trim() || isLoading}
                aria-label={isLoading ? "검색을 진행 중입니다" : "검색 시작"}
                className="min-h-[48px] rounded-[18px] bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:from-emerald-300 hover:to-cyan-300 disabled:cursor-not-allowed disabled:opacity-35 sm:px-6"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    리포트 생성 중
                  </span>
                ) : (
                  "리포트 만들기"
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {trendingQueries.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-300">지금 많이 찾거나 최근에 살펴본 주제</p>
            <p className="text-xs text-slate-500">실시간 반응과 최근 검색이 함께 반영됩니다</p>
          </div>
          <div className="flex flex-wrap gap-2.5" role="group" aria-label="추천 검색어">
            {trendingQueries.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setQuery(item);
                  onSearch(item);
                }}
                className="min-h-[40px] rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-white"
                disabled={isLoading}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getRecentHistoryQueries(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as Array<{ query?: string }>;
    return parsed
      .map((item) => normalizeQuery(item?.query))
      .filter((item): item is string => Boolean(item));
  } catch {
    return [];
  }
}

function buildRotatingFallbackQueries(): string[] {
  const poolSize = ROTATING_FALLBACK_QUERIES.length;
  const daySeed = Math.floor(Date.now() / 86_400_000);
  const startIndex = daySeed % poolSize;
  const step = 5;

  return Array.from({ length: poolSize }, (_, offset) => {
    return ROTATING_FALLBACK_QUERIES[(startIndex + (offset * step)) % poolSize];
  });
}

function mergeUniqueQueries(...groups: string[][]): string[] {
  const merged: string[] = [];
  const seen = new Set<string>();

  for (const group of groups) {
    for (const item of group) {
      const normalized = normalizeQuery(item);
      if (!normalized) {
        continue;
      }

      const dedupeKey = normalized.toLocaleLowerCase("ko-KR");
      if (seen.has(dedupeKey)) {
        continue;
      }

      seen.add(dedupeKey);
      merged.push(normalized);
    }
  }

  return merged;
}

function normalizeQuery(value?: string | null) {
  return (value || "").trim();
}
