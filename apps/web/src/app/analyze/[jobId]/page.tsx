"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ResultCard from "@/components/ResultCard";
import UrlAnalysisProgress from "@/components/UrlAnalysisProgress";
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
      setError("URL 분석 결과를 불러오는 데 실패했습니다.");
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
    <main id="main-content" className="min-h-screen px-5 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-5xl">
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
              <p className="text-sm font-semibold text-[#8b95a1]">단일 URL 분석</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-[#191f28]">URL 분석 결과</h1>
            </div>
          </div>

          {data?.url && (
            <div className="max-w-2xl rounded-full bg-[#eef4ff] px-4 py-2 text-sm font-semibold text-[#3182f6]">
              <span className="mr-2">대상 URL</span>
              <span className="break-all text-[#191f28]">{data.url}</span>
            </div>
          )}
        </header>

        {(error || isFailed) && (
          <section className="mx-auto mt-12 max-w-2xl">
            <div className="rounded-[28px] border border-[#f1b7b4] bg-[#fff5f5] p-6 text-center">
              <p className="text-sm text-[#b42318]">{error || data?.error_message || "분석 중 오류가 발생했습니다."}</p>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#4e5968] transition hover:bg-[#f8fafb]"
              >
                돌아가기
              </button>
            </div>
          </section>
        )}

        {isAnalyzing && <UrlAnalysisProgress url={data?.url} />}

        {isDone && data?.result && (
          <>
            <section className="mb-6 rounded-[28px] border border-[#e5e8eb] bg-white p-5 text-sm leading-6 text-[#6b7684] shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
              단일 URL 분석은 해당 페이지 자체의 표현과 구조만 대상으로 합니다. 검색 결과 전체 합의도는 포함되지 않으며, 원문 확인이 필요합니다.
            </section>
            <ResultCard result={data.result} />
          </>
        )}

        {isDone && !data?.result && !error && (
          <section className="rounded-[28px] border border-[#e5e8eb] bg-white p-8 text-center text-[#6b7684]">
            분석은 완료됐지만 표시할 수 있는 결과가 아직 없습니다. 다른 공개 URL로 다시 시도해보세요.
          </section>
        )}

        {isDone && (
          <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-6 text-[#8b95a1]">
            이 분석 결과는 AI에 의한 자동 평가이며 사실 확정이 아닙니다. 법적 판단이나 단정적 낙인 용도로 사용하면 안 됩니다.
          </p>
        )}
      </div>
    </main>
  );
}
