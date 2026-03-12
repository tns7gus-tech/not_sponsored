"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import ResultList from "@/components/ResultList";
import SearchProgress from "@/components/SearchProgress";
import { getApiErrorMessage, getSearchResults, isApiError, type SearchJobDetail } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";

const TIER_LABELS: Record<string, string> = {
  S: "매우 높음",
  A: "높음",
  B: "보통",
  C: "낮음",
  F: "주의",
};

const TIER_COLORS: Record<string, string> = {
  S: "bg-[#3182f6]",
  A: "bg-[#5aa5ff]",
  B: "bg-[#ffb020]",
  C: "bg-[#ff8a3d]",
  F: "bg-[#ff5f5f]",
};

interface ErrorInfo {
  message: string;
  status?: number;
}

export default function SearchResultsPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const router = useRouter();
  const [data, setData] = useState<SearchJobDetail | null>(null);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const completedTrackedRef = useRef(false);

  const fetchResults = useCallback(async () => {
    try {
      const result = await getSearchResults(jobId);
      setData(result);
      setError(null);
      return result.status;
    } catch (caughtError) {
      setError({
        message: getApiErrorMessage(caughtError, "검색 결과를 불러오지 못했습니다."),
        status: isApiError(caughtError) ? caughtError.status : undefined,
      });
      return "failed";
    }
  }, [jobId]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    const poll = async () => {
      const status = await fetchResults();
      if (status === "queued" || status === "running") {
        timer = setTimeout(poll, 1500);
      }
    };

    void poll();
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [fetchResults]);

  useEffect(() => {
    if (data?.status === "completed" && !completedTrackedRef.current) {
      completedTrackedRef.current = true;
      void trackEvent("search_results_view", {
        jobId,
        queryText: data.query,
        details: {
          totalResults: data.summary?.total_results ?? 0,
          overallStatus: data.summary?.overall_status ?? null,
        },
      });
    }
  }, [data, jobId]);

  const isSearching = data?.status === "queued" || data?.status === "running";
  const isDone = data?.status === "completed";
  const isFailed = data?.status === "failed";
  const totalResults = data?.summary?.total_results ?? 0;
  const hasSparseResults = isDone && totalResults > 0 && totalResults < 4;
  const errorState = getSearchErrorState(error, data?.error_message, data?.query);

  return (
    <main id="main-content" className="min-h-screen px-5 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              aria-label="홈으로 돌아가기"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#4e5968] shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition hover:bg-[#f8fafb]"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div>
              <p className="text-sm font-semibold text-[#8b95a1]">검색 결과</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-[#191f28]">리서치 결과</h1>
            </div>
          </div>

          {data?.query && (
            <div className="inline-flex items-center gap-2 self-start rounded-full bg-[#eef4ff] px-4 py-2 text-sm font-semibold text-[#3182f6]">
              <span>질의</span>
              <span className="text-[#191f28]">{data.query}</span>
            </div>
          )}
        </header>

        {(error || isFailed) && errorState && (
          <section className="mx-auto mt-12 max-w-2xl">
            <div className="rounded-[28px] border border-[#f1b7b4] bg-[#fff5f5] p-6">
              <p className="text-sm font-semibold text-[#912018]">{errorState.title}</p>
              <p className="mt-2 text-sm leading-6 text-[#b42318]">{errorState.message}</p>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-[#912018]">
                {errorState.hints.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#d92d20]" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => router.push(errorState.primaryAction.href)}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#4e5968] transition hover:bg-[#f8fafb]"
                >
                  {errorState.primaryAction.label}
                </button>
                {errorState.secondaryAction && (
                  <button
                    type="button"
                    onClick={() => router.push(errorState.secondaryAction.href)}
                    className="rounded-full border border-[#e5e8eb] bg-transparent px-4 py-2 text-sm font-semibold text-[#912018] transition hover:bg-white/60"
                  >
                    {errorState.secondaryAction.label}
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {isSearching && data && (
          <SearchProgress query={data.query} expandedQueries={data.expanded_queries || undefined} progress={data.progress || undefined} />
        )}

        {isDone && data && (
          <>
            <section
              aria-labelledby="search-summary-title"
              className="mb-8 rounded-[32px] border border-[#e5e8eb] bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.06)] sm:p-7"
            >
              <div className="flex flex-col gap-3 border-b border-[#eef1f4] pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#8b95a1]">요약</p>
                  <h2 id="search-summary-title" className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#191f28]">
                    {data.query} 리서치 요약
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[#6b7684]">
                    광고성 신호와 실사용 표현을 함께 읽어, 참고할 만한 결과를 먼저 위로 배치합니다.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {data.summary?.overall_status === "HIGH_TRUST" && (
                    <span className="rounded-full bg-[#eef9f3] px-3 py-1 text-sm font-semibold text-[#1b7f5a]">
                      실사용 근거가 비교적 많습니다
                    </span>
                  )}
                  {data.summary?.overall_status === "AD_DENSE" && (
                    <span className="rounded-full bg-[#fff3f2] px-3 py-1 text-sm font-semibold text-[#d92d20]">
                      광고성 신호 비중이 높습니다
                    </span>
                  )}
                  {data.summary?.overall_status === "CAUTION" && (
                    <span className="rounded-full bg-[#fff8f0] px-3 py-1 text-sm font-semibold text-[#d66b00]">
                      추가 확인이 필요합니다
                    </span>
                  )}
                  <span className="rounded-full bg-[#f2f4f6] px-3 py-1 text-sm font-semibold text-[#4e5968]">
                    총 {data.summary?.total_results || 0}건
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.95fr]">
                <div className="grid gap-5 md:grid-cols-2">
                  <section className="rounded-[24px] bg-[#f6fbf8] p-5">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1b7f5a]">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      주요 강점 / 실사용 근거
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {data.summary?.pros && data.summary.pros.length > 0 ? (
                        data.summary.pros.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm leading-6 text-[#333d4b]">
                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#1b7f5a]" aria-hidden="true" />
                            <span>{item}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-[#8b95a1]">실사용 장점 신호가 충분히 모이지 않았습니다.</li>
                      )}
                    </ul>
                  </section>

                  <section className="rounded-[24px] bg-[#fff8f0] p-5">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-[#d66b00]">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      주요 단점 / 주의 신호
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {data.summary?.cons && data.summary.cons.length > 0 ? (
                        data.summary.cons.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm leading-6 text-[#333d4b]">
                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#d66b00]" aria-hidden="true" />
                            <span>{item}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-[#8b95a1]">반복적으로 드러난 주의 신호는 많지 않습니다.</li>
                      )}
                    </ul>
                  </section>
                </div>

                <section className="rounded-[24px] bg-[#fafbfc] p-5">
                  <h3 className="text-sm font-semibold text-[#191f28]">등급 분포</h3>
                  <p className="mt-2 text-sm leading-6 text-[#6b7684]">
                    등급은 광고성 신호와 실사용 근거를 조합한 참고 지표입니다. 원문과 판매 조건은 꼭 다시 확인하세요.
                  </p>
                  <div className="mt-5 space-y-3.5">
                    {(["S", "A", "B", "C", "F"] as const).map((tier) => {
                      const count = data.summary?.tier_distribution?.[tier] || 0;
                      const maxCount = Math.max(
                        1,
                        ...(Object.values(data.summary?.tier_distribution || { S: 0, A: 0, B: 0, C: 0, F: 0 }) as number[]),
                      );
                      const percentage = (count / maxCount) * 100;

                      return (
                        <div key={tier} className="grid grid-cols-[60px_88px_1fr_32px] items-center gap-3 text-sm">
                          <span className="font-semibold text-[#191f28]">{tier}</span>
                          <span className="text-xs text-[#8b95a1]">{TIER_LABELS[tier]}</span>
                          <div className="h-2 rounded-full bg-[#e5e8eb]">
                            <div className={`h-2 rounded-full ${TIER_COLORS[tier]} transition-all duration-700`} style={{ width: `${percentage}%` }} />
                          </div>
                          <span className="text-right text-[#4e5968]">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            </section>

            {hasSparseResults && (
              <section className="mb-6 rounded-[28px] border border-[#ffe2b8] bg-[#fff8f0] p-5 text-sm leading-6 text-[#8a4b00] shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
                <p className="font-semibold">이번 검색은 공개 근거 수가 적습니다</p>
                <p className="mt-2">
                  브랜드명, 모델명, 사용 기간, 비교 대상 같은 단서를 더 넣으면 반복되는 실사용 신호를 더 잘 모을 수 있습니다.
                </p>
              </section>
            )}

            {data.results.length > 0 ? (
              <ResultList results={data.results} platforms={data.summary?.platforms || []} />
            ) : (
              <section className="rounded-[28px] border border-[#e5e8eb] bg-white p-8 text-center">
                <h3 className="text-lg font-semibold text-[#191f28]">수집된 결과가 충분하지 않습니다</h3>
                <p className="mt-2 text-sm leading-6 text-[#6b7684]">
                  검색어가 너무 넓거나 공개된 후기 데이터가 적을 수 있습니다. 다음 중 하나로 다시 시도해 보세요.
                </p>
                <ul className="mt-5 space-y-2 text-sm leading-6 text-[#4e5968]">
                  <li>브랜드명과 모델명을 함께 넣기</li>
                  <li>배터리, 발열, 내구성처럼 궁금한 기준 추가하기</li>
                  <li>특정 리뷰 페이지가 있다면 공개 URL 분석으로 바로 보기</li>
                </ul>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => router.push(`/?q=${encodeURIComponent(data.query)}`)}
                    className="rounded-full bg-[#191f28] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2b3441]"
                  >
                    검색어 바꿔 다시 찾기
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(`/?source=search-empty&q=${encodeURIComponent(data.query)}`)}
                    className="rounded-full border border-[#e5e8eb] bg-white px-5 py-2.5 text-sm font-semibold text-[#4e5968] transition hover:bg-[#fafbfc]"
                  >
                    홈으로 돌아가기
                  </button>
                </div>
              </section>
            )}

            <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-6 text-[#8b95a1]">
              이 결과는 자동 수집과 추정에 기반한 참고 자료입니다. 구매 결정 전에는 원문과 판매 조건을 직접 확인해 주세요.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

function getSearchErrorState(error: ErrorInfo | null, backendMessage?: string, query?: string) {
  const message = backendMessage || error?.message || "검색 중 오류가 발생했습니다.";
  const primaryHref = query ? `/?q=${encodeURIComponent(query)}` : "/";
  const primaryLabel = query ? "같은 검색어로 다시 시작" : "홈으로 돌아가기";

  if (error?.status === 404 || message.includes("찾을 수 없습니다")) {
    return {
      title: "검색 작업을 찾지 못했습니다",
      message: "링크가 만료되었거나 아직 생성되지 않은 작업일 수 있습니다.",
      hints: [
        "홈에서 검색을 다시 시작해 새 작업을 생성해 주세요.",
        "북마크한 오래된 링크라면 최신 결과를 다시 만드는 편이 안전합니다.",
      ],
      primaryAction: { label: primaryLabel, href: primaryHref },
    };
  }

  if (error?.status === 429) {
    return {
      title: "요청이 잠시 많습니다",
      message: "같은 시점에 요청이 몰려 결과 조회가 잠시 제한되었습니다.",
      hints: ["잠시 후 다시 시도하면 대부분 해소됩니다.", "반복 새로고침 대신 잠시 기다린 뒤 홈에서 다시 시작해 주세요."],
      primaryAction: { label: "홈으로 돌아가기", href: "/" },
    };
  }

  return {
    title: "검색 결과를 만들지 못했습니다",
    message,
    hints: [
      "네트워크 지연이나 외부 소스 응답 문제로 작업이 중단됐을 수 있습니다.",
      "검색어를 조금 더 구체적으로 바꾸면 결과가 안정적으로 모일 수 있습니다.",
    ],
    primaryAction: { label: primaryLabel, href: primaryHref },
    secondaryAction: { label: "홈으로 돌아가기", href: "/" },
  };
}
