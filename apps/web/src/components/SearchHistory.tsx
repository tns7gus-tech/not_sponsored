"use client";

import { useEffect, useState } from "react";

export interface SearchHistoryItem {
  query: string;
  jobId: string;
  timestamp: number;
}

interface Props {
  onHistoryClick: (query: string, jobId: string) => void;
}

export default function SearchHistory({ onHistoryClick }: Props) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("not_sponsored_history");
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as SearchHistoryItem[];
      const normalized = parsed
        .filter((item) => item?.query && item?.jobId && item?.timestamp)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 6);

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHistory(normalized);
    } catch {
      localStorage.removeItem("not_sponsored_history");
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("not_sponsored_history");
    setHistory([]);
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="recent-searches-title"
      className="mx-auto mt-12 w-full max-w-2xl animate-fade-in rounded-[28px] border border-white/8 bg-[rgba(7,14,26,0.72)] p-5 shadow-[0_18px_50px_rgba(4,10,20,0.18)] backdrop-blur-xl sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="recent-searches-title" className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <svg className="h-4 w-4 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          최근 조회한 리서치
        </h2>
        <button
          type="button"
          onClick={clearHistory}
          className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-white/20 hover:text-white"
        >
          전체 삭제
        </button>
      </div>

      <ul className="flex flex-wrap gap-2.5" aria-label="최근 검색 기록">
        {history.map((item) => (
          <li key={item.jobId}>
            <button
              type="button"
              onClick={() => onHistoryClick(item.query, item.jobId)}
              className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-left transition hover:border-cyan-300/30 hover:bg-cyan-300/8 focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              <span className="text-sm font-medium text-slate-200 transition group-hover:text-white">
                {item.query}
              </span>
              <span className="text-[11px] text-slate-500">
                {new Date(item.timestamp).toLocaleDateString("ko-KR", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
