import type { MouseEvent } from "react";

import { type SourceResult } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";

export interface ResultCardActionsProps {
  result: SourceResult;
  feedbackState: "helpful" | "ad_suspected" | null;
  handleFeedback: (event: MouseEvent, type: "helpful" | "ad_suspected") => void;
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
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="결과 피드백">
        <button
          type="button"
          onClick={(event) => handleFeedback(event, "helpful")}
          disabled={feedbackState !== null}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition focus-visible:ring-4 focus-visible:ring-[#3182f61f] ${
            feedbackState === "helpful"
              ? "bg-[#eef9f3] text-[#1b7f5a]"
              : feedbackState === "ad_suspected"
                ? "cursor-not-allowed bg-[#f2f4f6] text-[#b0b8c1] opacity-50"
                : "bg-[#f2f4f6] text-[#4e5968] hover:bg-[#e9edf2]"
          }`}
          aria-label={feedbackState === "helpful" ? "유용하다는 피드백을 보냈습니다" : "유용한 결과로 표시"}
          aria-pressed={feedbackState === "helpful"}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          {feedbackState === "helpful" ? "유용함" : "유용해요"}
        </button>

        <button
          type="button"
          onClick={(event) => handleFeedback(event, "ad_suspected")}
          disabled={feedbackState !== null}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition focus-visible:ring-4 focus-visible:ring-[#3182f61f] ${
            feedbackState === "ad_suspected"
              ? "bg-[#fff3f2] text-[#d92d20]"
              : feedbackState === "helpful"
                ? "cursor-not-allowed bg-[#f2f4f6] text-[#b0b8c1] opacity-50"
                : "bg-[#f2f4f6] text-[#4e5968] hover:bg-[#e9edf2]"
          }`}
          aria-label={feedbackState === "ad_suspected" ? "광고 의심 피드백을 보냈습니다" : "광고성으로 의심됨"}
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
            onClick={(event) => {
              event.stopPropagation();
              if (!disabledCompare || isComparing) {
                onCompareToggle();
              }
            }}
            disabled={disabledCompare && !isComparing}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition focus-visible:ring-4 focus-visible:ring-[#3182f61f] ${
              isComparing
                ? "bg-[#eef4ff] text-[#3182f6]"
                : disabledCompare
                  ? "cursor-not-allowed bg-[#f2f4f6] text-[#b0b8c1] opacity-50"
                  : "bg-[#f2f4f6] text-[#4e5968] hover:bg-[#e9edf2]"
            }`}
            aria-pressed={isComparing}
            aria-label={isComparing ? "비교 목록에서 제거" : "비교 목록에 추가"}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
            {isComparing ? "비교에서 제거" : "비교에 담기"}
          </button>
        )}

        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => {
            event.stopPropagation();
            void trackEvent("source_click", {
              details: {
                resultId: result.id,
                platform: result.platform,
                url: result.url,
              },
            });
          }}
          aria-label={`원문 보기: ${result.title}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#eef4ff] px-3 py-2 text-xs font-semibold text-[#3182f6] transition hover:bg-[#dbeafe]"
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
