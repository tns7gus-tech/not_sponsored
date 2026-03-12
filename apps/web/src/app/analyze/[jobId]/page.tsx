"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import ResultCard from "@/components/ResultCard";
import UrlAnalysisProgress from "@/components/UrlAnalysisProgress";
import { getApiErrorMessage, getUrlAnalysis, isApiError, type UrlAnalysisJobDetail } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";

interface ErrorInfo {
  message: string;
  status?: number;
}

export default function AnalyzeResultPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const router = useRouter();
  const [data, setData] = useState<UrlAnalysisJobDetail | null>(null);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const completedTrackedRef = useRef(false);

  const fetchResults = useCallback(async () => {
    try {
      const result = await getUrlAnalysis(jobId);
      setData(result);
      setError(null);
      return result.status;
    } catch (caughtError) {
      setError({
        message: getApiErrorMessage(caughtError, "URL 분석 결과를 불러오지 못했습니다."),
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
      void trackEvent("url_analysis_view", {
        jobId,
        details: {
          url: data.url,
          hasResult: Boolean(data.result),
        },
      });
    }
  }, [data, jobId]);

  const isAnalyzing = data?.status === "queued" || data?.status === "running";
  const isDone = data?.status === "completed";
  const isFailed = data?.status === "failed";
  const errorState = getAnalyzeErrorState(error, data?.error_message, data?.url);

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

        {isAnalyzing && <UrlAnalysisProgress url={data?.url} />}

        {isDone && data?.result && (
          <>
            <section className="mb-6 rounded-[28px] border border-[#e5e8eb] bg-white p-5 text-sm leading-6 text-[#6b7684] shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
              단일 URL 분석은 해당 페이지 자체의 표현과 구조를 보는 기능입니다. 검색 결과 전체 흐름을 대체하지 않으며 원문 확인은 여전히 중요합니다.
            </section>
            <ResultCard result={data.result} />
          </>
        )}

        {isDone && !data?.result && !error && (
          <section className="rounded-[28px] border border-[#e5e8eb] bg-white p-8 text-center">
            <h2 className="text-lg font-semibold text-[#191f28]">분석은 끝났지만 표시할 카드가 없습니다</h2>
            <p className="mt-2 text-sm leading-6 text-[#6b7684]">
              공개 HTML 본문이 너무 짧거나, 실제 웹 문서가 아닌 주소였을 수 있습니다. 아래 기준을 확인해 주세요.
            </p>
            <ul className="mt-5 space-y-2 text-sm leading-6 text-[#4e5968]">
              <li>브라우저에서 바로 열리는 공개 페이지인지 확인하기</li>
              <li>앱 딥링크, 파일 다운로드 주소, 빈 미리보기 페이지는 피하기</li>
              <li>로그인 필요 페이지나 내부망 주소가 아닌지 확인하기</li>
            </ul>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => router.push(`/?url=${encodeURIComponent(data.url)}`)}
                className="rounded-full bg-[#191f28] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2b3441]"
              >
                다른 URL로 다시 분석
              </button>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="rounded-full border border-[#e5e8eb] bg-white px-5 py-2.5 text-sm font-semibold text-[#4e5968] transition hover:bg-[#fafbfc]"
              >
                홈으로 돌아가기
              </button>
            </div>
          </section>
        )}

        {isDone && (
          <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-6 text-[#8b95a1]">
            이 분석 결과는 자동 추정에 기반한 참고 자료입니다. 사실 확정이나 법적 판단 용도로 사용하지 마세요.
          </p>
        )}
      </div>
    </main>
  );
}

function getAnalyzeErrorState(error: ErrorInfo | null, backendMessage?: string, url?: string) {
  const message = backendMessage || error?.message || "분석 중 오류가 발생했습니다.";
  const retryHref = url ? `/?url=${encodeURIComponent(url)}` : "/";

  if (error?.status === 404 || message.includes("찾을 수 없습니다")) {
    return {
      title: "분석 작업을 찾지 못했습니다",
      message: "링크가 만료되었거나 아직 생성되지 않은 작업일 수 있습니다.",
      hints: ["홈에서 URL을 다시 넣어 새 분석 작업을 시작해 주세요.", "오래된 링크를 북마크했다면 최신 작업으로 다시 보는 편이 안전합니다."],
      primaryAction: { label: url ? "같은 URL로 다시 시작" : "홈으로 돌아가기", href: retryHref },
    };
  }

  if (message.includes("HTML 문서만 분석할 수 있습니다")) {
    return {
      title: "웹 문서가 아닌 주소입니다",
      message,
      hints: ["PDF, 이미지 파일, 앱 전용 링크는 분석 대상이 아닙니다.", "브라우저에서 본문이 보이는 공개 HTML 주소를 넣어 주세요."],
      primaryAction: { label: "다른 URL 분석하기", href: retryHref },
      secondaryAction: { label: "홈으로 돌아가기", href: "/" },
    };
  }

  if (message.includes("본문을 충분히 추출하지 못했습니다")) {
    return {
      title: "본문을 읽기 어려운 페이지입니다",
      message,
      hints: ["미리보기 페이지만 노출되거나 스크립트 의존도가 높은 페이지일 수 있습니다.", "리뷰 본문이 직접 보이는 공개 페이지 URL로 다시 시도해 주세요."],
      primaryAction: { label: "다른 URL 분석하기", href: retryHref },
      secondaryAction: { label: "홈으로 돌아가기", href: "/" },
    };
  }

  if (
    message.includes("공개 웹 주소") ||
    message.includes("사설망") ||
    message.includes("표준 웹 포트") ||
    message.includes("http 또는 https")
  ) {
    return {
      title: "공개 URL만 분석할 수 있습니다",
      message,
      hints: ["로그인 필요 페이지, 내부망, 비표준 포트 주소는 제외됩니다.", "브라우저에서 직접 열리는 공개 웹페이지 주소로 다시 시도해 주세요."],
      primaryAction: { label: "URL 다시 입력하기", href: retryHref },
      secondaryAction: { label: "홈으로 돌아가기", href: "/" },
    };
  }

  return {
    title: "URL 분석을 완료하지 못했습니다",
    message,
    hints: ["대상 페이지 연결이 불안정하거나 외부 서버가 응답하지 않았을 수 있습니다.", "잠시 후 다시 시도하거나 다른 공개 페이지 URL로 바꿔 보세요."],
    primaryAction: { label: "다른 URL 분석하기", href: retryHref },
    secondaryAction: { label: "홈으로 돌아가기", href: "/" },
  };
}
