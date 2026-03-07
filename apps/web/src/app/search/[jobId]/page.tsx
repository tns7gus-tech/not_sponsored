"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ResultList from "@/components/ResultList";
import SearchProgress from "@/components/SearchProgress";
import { getSearchResults, type SearchJobDetail } from "@/lib/api";

const TIER_LABELS: Record<string, string> = {
  S: "매우 높음",
  A: "높음",
  B: "보통",
  C: "낮음",
  F: "주의",
};

const TIER_COLORS: Record<string, string> = {
  S: "bg-emerald-400",
  A: "bg-sky-400",
  B: "bg-amber-400",
  C: "bg-orange-400",
  F: "bg-rose-400",
};

export default function SearchResultsPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  const router = useRouter();
  const [data, setData] = useState<SearchJobDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    try {
      const result = await getSearchResults(jobId);
      setData(result);
      return result.status;
    } catch {
      setError("결과를 불러오는 데 실패했습니다.");
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

    poll();
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [fetchResults]);

  const isSearching = data?.status === "queued" || data?.status === "running";
  const isDone = data?.status === "completed";
  const isFailed = data?.status === "failed";

  return (
    <main id="main-content" className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              aria-label="홈으로 돌아가기"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Search Session</p>
              <h1 className="mt-1 text-2xl font-semibold text-white">리서치 결과</h1>
            </div>
          </div>

          {data?.query && (
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
              <span className="text-cyan-300/80">질의</span>
              <span className="font-medium text-white">{data.query}</span>
            </div>
          )}
        </header>

        {(error || isFailed) && (
          <section className="mx-auto mt-12 max-w-2xl">
            <div className="rounded-[28px] border border-red-500/20 bg-red-500/10 p-6 text-center">
              <p className="text-sm text-red-100">{error || data?.error_message || "검색 중 오류가 발생했습니다."}</p>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
              >
                다시 검색하기
              </button>
            </div>
          </section>
        )}

        {isSearching && data && (
          <SearchProgress
            query={data.query}
            expandedQueries={data.expanded_queries || undefined}
            progress={data.progress || undefined}
          />
        )}

        {isDone && data && (
          <>
            <section
              aria-labelledby="search-summary-title"
              className="mb-8 rounded-[30px] border border-white/10 bg-[rgba(9,17,29,0.78)] p-6 shadow-[0_24px_72px_rgba(4,10,20,0.28)] backdrop-blur-xl sm:p-7"
            >
              <div className="flex flex-col gap-3 border-b border-white/8 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Session Summary</p>
                  <h2 id="search-summary-title" className="mt-2 text-2xl font-semibold text-white">
                    {data.query} 리서치 요약
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    광고 가능성 신호와 실사용 표현을 함께 읽어 상대적으로 참고할 만한 결과를 먼저 배치했습니다.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.summary?.overall_status === "HIGH_TRUST" && (
                    <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-sm text-emerald-100">
                      신뢰 근거가 비교적 잘 모였습니다
                    </span>
                  )}
                  {data.summary?.overall_status === "AD_DENSE" && (
                    <span className="rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-1 text-sm text-rose-100">
                      광고성 패턴 비중이 높습니다
                    </span>
                  )}
                  {data.summary?.overall_status === "CAUTION" && (
                    <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-sm text-amber-100">
                      원문 교차 확인이 필요합니다
                    </span>
                  )}
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200">
                    총 {data.summary?.total_results || 0}건
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.95fr]">
                <div className="grid gap-5 md:grid-cols-2">
                  <section className="rounded-[24px] border border-emerald-400/10 bg-emerald-400/5 p-5">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-100">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      주요 장점 / 실사용 포인트
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {data.summary?.pros && data.summary.pros.length > 0 ? (
                        data.summary.pros.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm leading-6 text-slate-200">
                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-300" aria-hidden="true" />
                            <span>{item}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-slate-400">뾰족한 실사용 장점 신호는 아직 많지 않습니다.</li>
                      )}
                    </ul>
                  </section>

                  <section className="rounded-[24px] border border-rose-400/10 bg-rose-400/5 p-5">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-rose-100">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      주요 단점 / 주의 포인트
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {data.summary?.cons && data.summary.cons.length > 0 ? (
                        data.summary.cons.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm leading-6 text-slate-200">
                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-rose-300" aria-hidden="true" />
                            <span>{item}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-slate-400">반복적으로 포착된 단점 신호는 많지 않습니다.</li>
                      )}
                    </ul>
                  </section>
                </div>

                <section className="rounded-[24px] border border-white/10 bg-slate-950/30 p-5">
                  <h3 className="text-sm font-semibold text-white">신뢰 등급 분포</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    등급은 광고성 차감과 실사용 가점을 조합한 내부 산식 기준입니다. 원문 확인 전 최종 판단으로 사용하면 안 됩니다.
                  </p>
                  <div className="mt-5 space-y-3.5">
                    {(["S", "A", "B", "C", "F"] as const).map((tier) => {
                      const count = data.summary?.tier_distribution?.[tier] || 0;
                      const maxCount = Math.max(
                        1,
                        ...(Object.values(
                          data.summary?.tier_distribution || { S: 0, A: 0, B: 0, C: 0, F: 0 },
                        ) as number[]),
                      );
                      const percentage = (count / maxCount) * 100;

                      return (
                        <div key={tier} className="grid grid-cols-[60px_88px_1fr_32px] items-center gap-3 text-sm">
                          <span className="font-semibold text-slate-200">{tier}</span>
                          <span className="text-xs text-slate-400">{TIER_LABELS[tier]}</span>
                          <div className="h-2 rounded-full bg-white/8">
                            <div
                              className={`h-2 rounded-full ${TIER_COLORS[tier]} transition-all duration-700`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-right text-slate-200">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            </section>

            {data.results.length > 0 ? (
              <ResultList results={data.results} platforms={data.summary?.platforms || []} />
            ) : (
              <section className="rounded-[28px] border border-white/10 bg-white/5 p-8 text-center text-slate-300">
                수집된 결과가 아직 없습니다. API 키 설정 또는 커넥터 연결 상태를 확인해보세요.
              </section>
            )}

            <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-6 text-slate-400">
              이 결과는 AI 기반 자동 수집 및 추정 결과이며 사실의 확정이 아닙니다. 구매 결정 전에는 원문과 판매 조건을 직접 확인하세요.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
