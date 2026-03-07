"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ResultCard from "@/components/ResultCard";
import { getUrlAnalysis, type UrlAnalysisJobDetail } from "@/lib/api";

export default function AnalyzeResultPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  const router = useRouter();
  const [data, setData] = useState<UrlAnalysisJobDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    try {
      const result = await getUrlAnalysis(jobId);
      setData(result);
      return result.status;
    } catch {
      setError("분석 결과를 불러오는 데 실패했습니다.");
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

  const isAnalyzing = data?.status === "queued" || data?.status === "running";
  const isDone = data?.status === "completed";
  const isFailed = data?.status === "failed";

  return (
    <main id="main-content" className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-5xl">
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
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Single URL Review</p>
              <h1 className="mt-1 text-2xl font-semibold text-white">URL 분석 결과</h1>
            </div>
          </div>

          {data?.url && (
            <div className="max-w-2xl rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10 px-4 py-2 text-sm text-fuchsia-100">
              <span className="mr-2 text-fuchsia-300/80">대상 URL</span>
              <span className="break-all">{data.url}</span>
            </div>
          )}
        </header>

        {(error || isFailed) && (
          <section className="mx-auto mt-12 max-w-2xl">
            <div className="rounded-[28px] border border-red-500/20 bg-red-500/10 p-6 text-center">
              <p className="text-sm text-red-100">{error || data?.error_message || "분석 중 오류가 발생했습니다."}</p>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
              >
                돌아가기
              </button>
            </div>
          </section>
        )}

        {isAnalyzing && (
          <section
            aria-live="polite"
            aria-busy="true"
            className="mx-auto mt-16 max-w-3xl rounded-[30px] border border-white/10 bg-[rgba(9,17,29,0.78)] p-8 text-center shadow-[0_24px_72px_rgba(4,10,20,0.28)] backdrop-blur-xl"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10">
              <svg className="h-8 w-8 animate-spin text-fuchsia-200" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-white">공개 URL을 안전하게 분석하는 중입니다</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              페이지를 불러오기 전에 공개 웹 주소 여부와 내부망 차단 규칙을 먼저 확인하고, HTML에서 요약 가능한 본문만 추출합니다.
            </p>
          </section>
        )}

        {isDone && data?.result && (
          <>
            <section className="mb-6 rounded-[28px] border border-white/10 bg-white/5 p-5 text-sm leading-6 text-slate-300">
              단일 URL 분석은 해당 페이지 자체의 표현과 구조만 대상으로 합니다. 검색 결과 전체 합의도는 포함되지 않으며, 원문 확인이 필요합니다.
            </section>
            <ResultCard result={data.result} />
          </>
        )}

        {isDone && !data?.result && !error && (
          <section className="rounded-[28px] border border-white/10 bg-white/5 p-8 text-center text-slate-300">
            분석은 완료됐지만 표시할 결과가 없습니다.
          </section>
        )}

        {isDone && (
          <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-6 text-slate-400">
            이 분석 결과는 AI에 의한 자동 평가이며 사실 확정이 아닙니다. 법적 판단이나 단정적 낙인 용도로 사용하면 안 됩니다.
          </p>
        )}
      </div>
    </main>
  );
}
