import React from "react";

import { type SourceResult } from "@/lib/api";

export interface ResultCardActionsProps {
  result: SourceResult;
  feedbackState: "helpful" | "ad_suspected" | null;
  handleFeedback: (e: React.MouseEvent, type: "helpful" | "ad_suspected") => void;
  isComparing?: boolean;
  onCompareToggle?: () => void;
  disabledCompare?: boolean;
}

export default function ResultCardActions({
  result,
  feedbackState,
  handleFeedback,
  isComparing,
  onCompareToggle,
  disabledCompare,
}: ResultCardActionsProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="결과 피드백">
        <button
          type="button"
          onClick={(e) => handleFeedback(e, "helpful")}
          disabled={feedbackState !== null}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
            feedbackState === "helpful"
              ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-300"
              : feedbackState === "ad_suspected"
                ? "cursor-not-allowed text-slate-500 opacity-40"
                : "border border-transparent bg-slate-900/70 text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
          aria-label={feedbackState === "helpful" ? "도움됨 피드백이 제출되었습니다" : "이 결과가 도움이 되었나요"}
          aria-pressed={feedbackState === "helpful"}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          {feedbackState === "helpful" ? "도움됨" : "도움돼요"}
        </button>

        <button
          type="button"
          onClick={(e) => handleFeedback(e, "ad_suspected")}
          disabled={feedbackState !== null}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
            feedbackState === "ad_suspected"
              ? "border border-rose-500/30 bg-rose-500/20 text-rose-300"
              : feedbackState === "helpful"
                ? "cursor-not-allowed text-slate-500 opacity-40"
                : "border border-transparent bg-slate-900/70 text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
          aria-label={feedbackState === "ad_suspected" ? "광고 의심 피드백이 제출되었습니다" : "이 결과가 광고 같다고 느껴지나요"}
          aria-pressed={feedbackState === "ad_suspected"}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
          </svg>
          {feedbackState === "ad_suspected" ? "광고 의심" : "광고 같아요"}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {onCompareToggle && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!disabledCompare || isComparing) {
                onCompareToggle();
              }
            }}
            disabled={disabledCompare && !isComparing}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
              isComparing
                ? "border border-indigo-500/30 bg-indigo-500/20 text-indigo-200"
                : disabledCompare
                  ? "cursor-not-allowed bg-slate-900/40 text-slate-500 opacity-50"
                  : "border border-transparent bg-slate-900/70 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
            aria-pressed={isComparing}
            aria-label={
              isComparing
                ? "비교함에서 이 결과를 제거합니다"
                : disabledCompare
                  ? "비교함이 가득 차서 추가할 수 없습니다"
                  : "이 결과를 비교함에 추가합니다"
            }
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
            {isComparing ? "비교함에서 제거" : "비교함에 담기"}
          </button>
        )}

        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          aria-label={`원문 보기: ${result.title} (새 탭에서 열림)`}
          className="inline-flex items-center gap-1.5 rounded-md py-1 text-sm font-medium text-cyan-300 transition-colors hover:text-cyan-200 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          원문 보기
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
