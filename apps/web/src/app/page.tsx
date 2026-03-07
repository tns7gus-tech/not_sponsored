"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import AppFeatures from "@/components/AppFeatures";
import HeroSection from "@/components/HeroSection";
import SearchHistory from "@/components/SearchHistory";
import SearchInput from "@/components/SearchInput";
import UrlAnalyzerInput from "@/components/UrlAnalyzerInput";
import { createSearch, createUrlAnalysis } from "@/lib/api";

const HISTORY_KEY = "not_sponsored_history";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"search" | "analyze">("search");

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { job_id } = await createSearch(query);

      const stored = localStorage.getItem(HISTORY_KEY);
      let history: { query: string; jobId: string; timestamp: number }[] = [];
      if (stored) {
        try {
          history = JSON.parse(stored);
        } catch {
          history = [];
        }
      }

      history = history.filter((item) => item.query !== query);
      history.unshift({ query, jobId: job_id, timestamp: Date.now() });
      if (history.length > 10) {
        history = history.slice(0, 10);
      }

      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      router.push(`/search/${job_id}`);
    } catch {
      setError("검색 요청에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.");
      setIsLoading(false);
    }
  };

  const handleAnalyze = async (url: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { job_id } = await createUrlAnalysis(url);
      router.push(`/analyze/${job_id}`);
    } catch {
      setError("URL 분석 요청에 실패했습니다. 공개 페이지 링크인지 다시 확인해주세요.");
      setIsLoading(false);
    }
  };

  return (
    <main id="main-content" className="min-h-screen px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col">
        <HeroSection />

        <section
          aria-labelledby="entry-mode-title"
          className="mx-auto w-full max-w-3xl rounded-[28px] border border-white/10 bg-[rgba(8,16,28,0.76)] p-4 shadow-[0_30px_80px_rgba(4,10,20,0.4)] backdrop-blur-xl sm:p-6"
        >
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
                Evidence First
              </p>
              <h2 id="entry-mode-title" className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                검색하거나, 링크 하나만 바로 분석하세요
              </h2>
            </div>
            <p className="max-w-md text-sm text-slate-300">
              공개된 검색 결과와 사용자 제공 URL만 다룹니다. 내부망, 로그인 필요 페이지, 비공개 영역은 제외됩니다.
            </p>
          </div>

          <div className="mb-6 inline-flex w-full flex-wrap gap-2 rounded-2xl border border-white/8 bg-slate-950/60 p-1.5 sm:w-auto">
            <button
              type="button"
              onClick={() => setMode("search")}
              aria-pressed={mode === "search"}
              className={`min-h-[44px] rounded-xl px-5 py-2.5 text-sm font-medium transition ${
                mode === "search"
                  ? "bg-slate-100 text-slate-950 shadow-sm"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              다중 키워드 검색
            </button>
            <button
              type="button"
              onClick={() => setMode("analyze")}
              aria-pressed={mode === "analyze"}
              className={`min-h-[44px] rounded-xl px-5 py-2.5 text-sm font-medium transition ${
                mode === "analyze"
                  ? "bg-slate-100 text-slate-950 shadow-sm"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              단일 URL 분석
            </button>
          </div>

          {mode === "search" ? (
            <SearchInput onSearch={handleSearch} isLoading={isLoading} />
          ) : (
            <UrlAnalyzerInput onAnalyze={handleAnalyze} isLoading={isLoading} />
          )}

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              {error}
            </div>
          )}
        </section>

        {!isLoading && mode === "search" && (
          <SearchHistory onHistoryClick={(_, jobId) => router.push(`/search/${jobId}`)} />
        )}

        <AppFeatures />
      </div>
    </main>
  );
}
