"use client";

import { useState } from "react";

import { PLATFORM_COLORS, PLATFORM_LABELS, submitFeedback, type SourceResult } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import ResultCardActions from "./ResultCardActions";
import ResultDetailModal from "./ResultDetailModal";
import ResultSignalGroups from "./ResultSignalGroups";

interface Props {
  result: SourceResult;
  isComparing?: boolean;
  onCompareToggle?: () => void;
  disabledCompare?: boolean;
}

export default function ResultCard({ result, isComparing, onCompareToggle, disabledCompare }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackState, setFeedbackState] = useState<"helpful" | "ad_suspected" | null>(null);

  const platformLabel = PLATFORM_LABELS[result.platform] || result.platform;
  const platformColor = PLATFORM_COLORS[result.platform] || "#8b95a1";
  const isVideo = result.media_types?.includes("video");
  const formattedPublishedAt = formatPublishedAt(result.published_at);

  const getTierClassName = (tier: string | undefined) => {
    switch (tier) {
      case "S":
        return "bg-[#eef9f3] text-[#1b7f5a]";
      case "A":
        return "bg-[#eef4ff] text-[#3182f6]";
      case "B":
        return "bg-[#fff8f0] text-[#d66b00]";
      case "F":
        return "bg-[#fff3f2] text-[#d92d20]";
      default:
        return "bg-[#f2f4f6] text-[#4e5968]";
    }
  };

  const handleFeedback = async (event: React.MouseEvent, type: "helpful" | "ad_suspected") => {
    event.stopPropagation();
    if (feedbackState) {
      return;
    }

    try {
      await submitFeedback(type, result.id, result.url);
      setFeedbackState(type);
      void trackEvent("feedback_submit", {
        details: {
          feedbackType: type,
          resultId: result.id,
          platform: result.platform,
        },
      });
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  const openDetail = () => {
    setIsModalOpen(true);
    void trackEvent("result_detail_open", {
      details: {
        resultId: result.id,
        platform: result.platform,
      },
    });
  };

  return (
    <>
      <article className="overflow-hidden rounded-[28px] border border-[#e5e8eb] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] sm:p-6">
        <div className="flex flex-col gap-4 border-b border-[#f2f4f6] pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                color: platformColor,
                backgroundColor: `${platformColor}12`,
              }}
            >
              {isVideo ? "영상" : "문서"}
              <span className="text-[#5b6675]">/</span>
              {platformLabel}
            </span>
            {formattedPublishedAt && <span className="text-xs text-[#5b6675]">{formattedPublishedAt}</span>}
          </div>

          <div className="flex items-center gap-2 self-start">
            {result.tier && (
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getTierClassName(result.tier)}`}>
                등급 {result.tier} · TSS {result.tss ?? 0}
              </span>
            )}
            <button
              type="button"
              onClick={openDetail}
              aria-haspopup="dialog"
              className="rounded-full bg-[#f2f4f6] px-3 py-1 text-xs font-semibold text-[#4e5968] transition hover:bg-[#e9edf2]"
            >
              자세히 보기
            </button>
          </div>
        </div>

        <h3 className="mt-5 text-xl font-semibold leading-8 tracking-[-0.03em] text-[#191f28]">{result.title}</h3>
        {result.author_name && <p className="mt-2 text-sm text-[#5b6675]">{result.author_name}</p>}
        {result.snippet && <p className="mt-4 text-sm leading-7 text-[#334155]">{result.snippet}</p>}

        <div className="mt-5">
          <ResultSignalGroups result={result} compact />
        </div>

        <ResultCardActions
          result={result}
          feedbackState={feedbackState}
          handleFeedback={handleFeedback}
          isComparing={isComparing}
          onCompareToggle={onCompareToggle}
          disabledCompare={disabledCompare}
        />
      </article>

      <ResultDetailModal result={result} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

function formatPublishedAt(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
