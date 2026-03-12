"use client";

import { useEffect, useState } from "react";

import { getTrendingSearches } from "@/lib/api";

interface Props {
  onSelect: (query: string) => void;
}

const FALLBACK_QUERIES = ["무선 이어폰 추천", "아이폰 17 실사용 후기", "로봇청소기 단점", "선크림 민감성 후기"];

export default function TrendingSearches({ onSelect }: Props) {
  const [queries, setQueries] = useState<string[]>(FALLBACK_QUERIES);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const items = await getTrendingSearches();
      if (!cancelled && items.length > 0) {
        setQueries(items);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section aria-labelledby="trending-searches-title" className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-slate-200">지금 많이 찾는 주제</p>
          <h2 id="trending-searches-title" className="mt-1 text-lg font-semibold text-white">
            바로 눌러서 리서치를 시작해 보세요
          </h2>
        </div>
        <p className="text-sm text-slate-100">최근 검색과 공개 추천 주제를 묶어서 보여줍니다.</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2.5">
        {queries.map((query) => (
          <button
            key={query}
            type="button"
            onClick={() => onSelect(query)}
            className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-medium text-white transition hover:border-cyan-300/30 hover:bg-cyan-300/12 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
          >
            {query}
          </button>
        ))}
      </div>
    </section>
  );
}
