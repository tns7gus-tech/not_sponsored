"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SearchInput from "@/components/SearchInput";
import UrlAnalyzerInput from "@/components/UrlAnalyzerInput";
import SearchHistory from "@/components/SearchHistory";
import HeroSection from "@/components/HeroSection";
import AppFeatures from "@/components/AppFeatures";
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

      // 검색 성공 시 localStorage 업데이트
      const stored = localStorage.getItem(HISTORY_KEY);
      let history: { query: string, jobId: string, timestamp: number }[] = [];
      if (stored) {
        try { history = JSON.parse(stored); } catch { /* ignore */ }
      }

      // 동일한 키워드 제거 후 최상단 추가 (최대 10개)
      history = history.filter(h => h.query !== query);
      history.unshift({ query, jobId: job_id, timestamp: Date.now() });
      if (history.length > 10) history = history.slice(0, 10);

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
      setError("URL 분석 요청에 실패했습니다. 링크가 올바른지 확인해주세요.");
      setIsLoading(false);
    }
  };

  return (
    <main id="main-content" className="flex flex-col items-center justify-center min-h-screen px-4">
      {/* 로고 + 타이틀 */}
      <HeroSection />

      {/* 모드 전환 탭 */}
      <div className="flex bg-gray-900/60 p-1.5 rounded-2xl mb-8 border border-gray-800">
        <button
          onClick={() => setMode("search")}
          className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${mode === "search"
            ? "bg-gray-800 text-white shadow-sm border border-gray-700"
            : "text-gray-400 hover:text-gray-200"
            }`}
        >
          🔍 다중 키워드 검색
        </button>
        <button
          onClick={() => setMode("analyze")}
          className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${mode === "analyze"
            ? "bg-gray-800 text-purple-400 shadow-sm border border-gray-700"
            : "text-gray-400 hover:text-gray-200"
            }`}
        >
          🔗 단일 URL 분석
        </button>
      </div>

      {/* 입력 */}
      {mode === "search" ? (
        <SearchInput onSearch={handleSearch} isLoading={isLoading} />
      ) : (
        <UrlAnalyzerInput onAnalyze={handleAnalyze} isLoading={isLoading} />
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="mt-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm max-w-lg text-center">
          {error}
        </div>
      )}

      {/* 최근 검색어 */}
      {!isLoading && mode === "search" && (
        <SearchHistory
          onHistoryClick={(query, jobId) => router.push(`/search/${jobId}`)}
        />
      )}

      {/* 하단 설명 및 면책 문구 */}
      <AppFeatures />
    </main>
  );
}
