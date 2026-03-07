"use client";

import { useEffect, useState, type FormEvent } from "react";

import { getTrendingSearches } from "@/lib/api";

interface Props {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

const FALLBACK_QUERIES = [
  "아이폰17",
  "나이키 페가수스 42",
  "쿠션 파운데이션",
  "에어프라이어",
  "갤럭시 S26",
  "건성 피부 선크림",
];

export default function SearchInput({ onSearch, isLoading }: Props) {
  const [query, setQuery] = useState("");
  const [trendingQueries, setTrendingQueries] = useState<string[]>(FALLBACK_QUERIES);

  useEffect(() => {
    async function fetchTrending() {
      const queries = await getTrendingSearches();
      if (queries.length > 0) {
        setTrendingQueries(queries);
      }
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
            예: `아이폰17 배터리 후기`, `건성 피부 선크림 추천`, `러닝화 실사용 비교`
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
                    분석 중
                  </span>
                ) : (
                  "검색"
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="mt-6">
        <p className="mb-3 text-sm font-medium text-slate-300">빠른 시작</p>
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
    </div>
  );
}
