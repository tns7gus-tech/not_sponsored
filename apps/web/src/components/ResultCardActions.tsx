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
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <div className="flex gap-2" role="group" aria-label="피드백 남기기 버튼">
                <button
                    onClick={(e) => handleFeedback(e, "helpful")}
                    disabled={feedbackState !== null}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 ${feedbackState === "helpful"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : feedbackState === "ad_suspected"
                                ? "opacity-30 cursor-not-allowed text-gray-400"
                                : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent"
                        }`}
                    aria-label={feedbackState === "helpful" ? "도움됨 피드백을 남겼습니다" : "이 결과가 도움이 되었나요? 피드백 남기기"}
                    aria-pressed={feedbackState === "helpful"}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    {feedbackState === "helpful" ? "도움됨!" : "도움돼요"}
                </button>
                <button
                    onClick={(e) => handleFeedback(e, "ad_suspected")}
                    disabled={feedbackState !== null}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 ${feedbackState === "ad_suspected"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : feedbackState === "helpful"
                                ? "opacity-30 cursor-not-allowed text-gray-400"
                                : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent"
                        }`}
                    aria-label={feedbackState === "ad_suspected" ? "광고 같음 피드백을 남겼습니다" : "이 결과가 광고로 의심되나요? 피드백 남기기"}
                    aria-pressed={feedbackState === "ad_suspected"}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                    </svg>
                    {feedbackState === "ad_suspected" ? "광고 같음!" : "광고 같아요"}
                </button>
            </div>

            <div className="flex gap-2 items-center">
                {onCompareToggle && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!disabledCompare || isComparing) onCompareToggle();
                        }}
                        disabled={disabledCompare && !isComparing}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 ${isComparing
                                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                                : disabledCompare
                                    ? "opacity-30 cursor-not-allowed text-gray-500 bg-gray-800/30"
                                    : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent"
                            }`}
                        aria-pressed={isComparing}
                        aria-label={isComparing ? "비교함에서 제외하기" : (disabledCompare ? "비교함이 가득 찼습니다" : "제품 비교함에 담기")}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                        {isComparing ? "비교함에 담김" : "+ 비교하기"}
                    </button>
                )}
                <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`원문 보기: ${result.title} (새 창에서 열림)`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-400 hover:text-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 rounded-sm transition-colors py-1"
                >
                    원문 보기
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
            </div>
        </div>
    );
}
