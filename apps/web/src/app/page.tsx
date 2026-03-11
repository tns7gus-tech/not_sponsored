"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import AppFeatures from "@/components/AppFeatures";
import ComparePreviewSection from "@/components/ComparePreviewSection";
import GuideHighlightsSection from "@/components/GuideHighlightsSection";
import HomeSampleSection from "@/components/HomeSampleSection";
import SearchHistory from "@/components/SearchHistory";
import SearchInput from "@/components/SearchInput";
import SupportScopeSection from "@/components/SupportScopeSection";
import TrendingSearches from "@/components/TrendingSearches";
import UrlAnalyzerInput from "@/components/UrlAnalyzerInput";
import { trackEvent } from "@/lib/analytics";
import { createSearch, createUrlAnalysis } from "@/lib/api";

const HISTORY_KEY = "not_sponsored_history";

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageFallback />}>
      <HomePageContent />
    </Suspense>
  );
}

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const initialUrl = searchParams.get("url") ?? "";

  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isUrlLoading, setIsUrlLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void trackEvent("page_view_home", {
      details: {
        source: searchParams.get("source") ?? "direct",
      },
    });
  }, [searchParams]);

  const storeHistory = (query: string, jobId: string) => {
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
    history.unshift({ query, jobId, timestamp: Date.now() });

    if (history.length > 10) {
      history = history.slice(0, 10);
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  };

  const handleSearch = async (query: string) => {
    setIsSearchLoading(true);
    setError(null);
    void trackEvent("search_submit", {
      queryText: query,
      details: { surface: "home" },
    });

    try {
      const { job_id } = await createSearch(query);
      storeHistory(query, job_id);
      router.push(`/search/${job_id}`);
    } catch {
      setError("검색을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      setIsSearchLoading(false);
    }
  };

  const handleAnalyze = async (url: string) => {
    setIsUrlLoading(true);
    setError(null);
    void trackEvent("url_analysis_submit", {
      details: {
        surface: "home",
        hostname: safeHostname(url),
      },
    });

    try {
      const { job_id } = await createUrlAnalysis(url);
      router.push(`/analyze/${job_id}`);
    } catch {
      setError("URL 분석을 시작하지 못했습니다. 공개 URL인지 다시 확인해 주세요.");
      setIsUrlLoading(false);
    }
  };

  const handleHistoryClick = (query: string, jobId: string) => {
    void trackEvent("history_open", {
      queryText: query,
      jobId,
      details: { surface: "home" },
    });
    router.push(`/search/${jobId}`);
  };

  const handleTrendingSelect = (query: string) => {
    void trackEvent("trending_click", {
      queryText: query,
      details: { surface: "home" },
    });
    void handleSearch(query);
  };

  return (
    <main id="main-content" className="min-h-screen px-5 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-6xl">
        <section className="overflow-hidden rounded-[34px] border border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_34%),linear-gradient(135deg,#07111d_0%,#0b1628_48%,#09131f_100%)] px-5 py-6 shadow-[0_28px_80px_rgba(4,10,20,0.24)] sm:px-8 sm:py-8">
          <header className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/" className="inline-flex items-center gap-3 self-start">
                <span className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-white text-lg font-semibold text-[#191f28]">
                  N
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Not Sponsored</span>
                  <span className="block text-sm text-slate-300">광고 문구보다 근거를 먼저 보여주는 구매 리서치</span>
                </span>
              </Link>

              <nav className="flex flex-wrap gap-2">
                <Link
                  href="/guides"
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-300/30 hover:bg-cyan-300/10"
                >
                  공개 가이드
                </Link>
                <Link
                  href="/terms"
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-300/30 hover:bg-cyan-300/10"
                >
                  이용 안내
                </Link>
              </nav>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
              <div className="max-w-3xl">
                <p className="inline-flex rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1 text-xs font-semibold tracking-[0.22em] text-cyan-100">
                  구매 전 리서치 시간을 줄이는 도구
                </p>
                <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.05em] text-white sm:text-5xl">
                  광고 같은 후기보다
                  <span className="block bg-gradient-to-r from-cyan-200 via-white to-emerald-200 bg-clip-text text-transparent">
                    실사용 근거를 먼저 보게 만듭니다
                  </span>
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                  네이버, 유튜브, 공개 URL에서 광고성 표현과 실제 사용 정황을 함께 모아 한 화면에서 정리합니다.
                </p>

                <div className="mt-6 flex flex-wrap gap-2.5">
                  {["실사용 후기 정리", "광고성 신호 표시", "공개 URL 직접 분석", "결과 비교와 재방문 흐름"].map((item) => (
                    <span key={item} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-white/5 p-4 backdrop-blur sm:p-5">
                <div className="rounded-[26px] border border-white/10 bg-[rgba(7,14,26,0.78)] p-4 sm:p-5">
                  <h2 className="text-lg font-semibold text-white">바로 시작하기</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    상품명으로 전체 리서치를 시작하거나 리뷰 페이지 URL 한 건을 직접 분석할 수 있습니다.
                  </p>

                  <div className="mt-5">
                    <SearchInput onSearch={handleSearch} isLoading={isSearchLoading} initialValue={initialQuery} />
                  </div>

                  <div className="mt-6 rounded-[24px] border border-white/8 bg-[rgba(4,10,20,0.4)] p-4">
                    <UrlAnalyzerInput onAnalyze={handleAnalyze} isLoading={isUrlLoading} initialValue={initialUrl} />
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="mt-5 rounded-[20px] border border-[#f1b7b4] bg-[#fff5f5] px-4 py-3 text-sm text-[#b42318]"
                    >
                      {error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <div className="mt-8 rounded-[28px] border border-white/8 bg-white/5 p-5">
            <TrendingSearches onSelect={handleTrendingSelect} />
          </div>
        </section>

        <SearchHistory onHistoryClick={handleHistoryClick} />

        <section className="mx-auto mt-14 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "광고 여부를 단정하지 않습니다",
              body: "광고성 표현과 근거 부족 신호를 보여주되 최종 판단은 사용자에게 남깁니다.",
            },
            {
              title: "공개 근거를 먼저 모읍니다",
              body: "후기를 하나씩 넘겨보는 대신 공개 결과를 한 번에 모아 빠르게 비교할 수 있게 만듭니다.",
            },
            {
              title: "배포 뒤에도 지표를 봅니다",
              body: "검색 시작, 결과 조회, 원문 클릭 같은 이벤트를 쌓아서 전환 문구를 계속 개선할 수 있습니다.",
            },
          ].map((item) => (
            <article key={item.title} className="rounded-[24px] border border-[#e5e8eb] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
              <h2 className="text-lg font-semibold text-[#191f28]">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#4e5968]">{item.body}</p>
            </article>
          ))}
        </section>

        <div className="mt-14 space-y-14">
          <HomeSampleSection />
          <AppFeatures />
          <GuideHighlightsSection />
          <ComparePreviewSection />
          <SupportScopeSection />
        </div>
      </div>
    </main>
  );
}

function HomePageFallback() {
  return (
    <main id="main-content" className="min-h-screen px-5 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl rounded-[34px] border border-white/12 bg-[linear-gradient(135deg,#07111d_0%,#0b1628_48%,#09131f_100%)] px-6 py-10 text-white shadow-[0_28px_80px_rgba(4,10,20,0.24)]">
        검색 화면을 준비하고 있습니다.
      </div>
    </main>
  );
}

function safeHostname(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}
