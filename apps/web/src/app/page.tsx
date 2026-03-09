"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import AppFeatures from "@/components/AppFeatures";
import ComparePreviewSection from "@/components/ComparePreviewSection";
import HeroSection from "@/components/HeroSection";
import HomeSampleSection from "@/components/HomeSampleSection";
import SearchHistory from "@/components/SearchHistory";
import SearchInput from "@/components/SearchInput";
import SupportScopeSection from "@/components/SupportScopeSection";
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
      setError("검색 요청에 실패했습니다. 잠시 후 다시 시도하거나 백엔드 연결 상태를 확인해주세요.");
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
      setError("URL 분석 요청에 실패했습니다. 공개 페이지 주소인지 다시 확인해주세요.");
      setIsLoading(false);
    }
  };

  return (
    <main id="main-content" className="min-h-screen px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col">
        <HeroSection />

        <section aria-labelledby="entry-mode-title" className="mx-auto w-full max-w-6xl">
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[28px] border border-white/10 bg-[rgba(8,16,28,0.76)] p-4 shadow-[0_30px_80px_rgba(4,10,20,0.4)] backdrop-blur-xl sm:p-6">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-[0.24em] text-cyan-300/80">검색 또는 URL 분석</p>
                  <h2 id="entry-mode-title" className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                    검색어로 리포트를 만들거나, 공개 URL 하나를 바로 읽어보세요
                  </h2>
                </div>
                <p className="max-w-md text-sm text-slate-300">
                  공개 검색 결과와 사용자가 입력한 공개 URL만 다룹니다. 로그인 필요 페이지, 비공개 영역, 내부망 주소는 처음부터
                  제외합니다.
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
                  검색 리포트 만들기
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
                  공개 URL 분석
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
            </div>

            <HomeSampleSection />
          </div>
        </section>

        {!isLoading && mode === "search" && (
          <SearchHistory onHistoryClick={(_, jobId) => router.push(`/search/${jobId}`)} />
        )}

        <AppFeatures />
        <SupportScopeSection />
        <ComparePreviewSection />
      </div>
    </main>
  );
}
