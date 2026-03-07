"use client";

import { useState } from "react";

import { PLATFORM_COLORS, PLATFORM_LABELS, submitFeedback, type SourceResult } from "@/lib/api";
import ResultCardActions from "./ResultCardActions";
import ResultDetailModal from "./ResultDetailModal";

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
  const platformColor = PLATFORM_COLORS[result.platform] || "#94a3b8";
  const isVideo = result.media_types?.includes("video");
  const formattedPublishedAt = formatPublishedAt(result.published_at);

  const getTierColor = (tier: string | undefined) => {
    switch (tier) {
      case "S":
        return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
      case "A":
        return "border-sky-300/25 bg-sky-300/10 text-sky-100";
      case "B":
        return "border-amber-300/25 bg-amber-300/10 text-amber-100";
      case "F":
        return "border-rose-300/25 bg-rose-300/10 text-rose-100";
      default:
        return "border-orange-300/20 bg-orange-300/10 text-orange-100";
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
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  return (
    <>
      <article className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[rgba(9,17,29,0.76)] p-5 shadow-[0_16px_48px_rgba(4,10,20,0.22)] backdrop-blur-xl transition hover:border-white/20 sm:p-6">
        <div
          className="absolute inset-y-0 left-0 w-1 rounded-l-[26px]"
          style={{ backgroundColor: platformColor }}
          aria-hidden="true"
        />

        <div className="pl-2 sm:pl-3">
          <div className="mb-4 flex flex-col gap-3 border-b border-white/8 pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium"
                style={{
                  color: platformColor,
                  borderColor: `${platformColor}33`,
                  backgroundColor: `${platformColor}14`,
                }}
              >
                {isVideo ? "영상" : "문서"}
                <span className="text-slate-100/70">/</span>
                {platformLabel}
              </span>
              {formattedPublishedAt && <span className="text-xs text-slate-400">{formattedPublishedAt}</span>}
            </div>

            <div className="flex items-center gap-2 self-start">
              {result.tier && (
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getTierColor(result.tier)}`}>
                  Tier {result.tier} / TSS {result.tss ?? 0}
                </span>
              )}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                aria-haspopup="dialog"
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 transition hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-white"
              >
                자세히 보기
              </button>
            </div>
          </div>

          <h3 className="text-lg font-semibold leading-7 text-white sm:text-xl">{result.title}</h3>

          {result.author_name && <p className="mt-2 text-sm text-slate-400">{result.author_name}</p>}

          {result.snippet && <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-200">{result.snippet}</p>}

          {result.explanations && result.explanations.length > 0 && (
            <ul className="mt-5 grid gap-2">
              {result.explanations.slice(0, 3).map((explanation) => {
                const tone = explanation.includes("+")
                  ? "border-emerald-300/10 bg-emerald-300/6 text-emerald-50"
                  : explanation.includes("-")
                    ? "border-rose-300/10 bg-rose-300/6 text-rose-50"
                    : "border-white/8 bg-white/5 text-slate-200";
                const marker = explanation.includes("+") ? "+" : explanation.includes("-") ? "-" : "i";

                return (
                  <li
                    key={explanation}
                    className={`flex items-start gap-2 rounded-2xl border px-3 py-2 text-sm leading-6 ${tone}`}
                  >
                    <span className="mt-0.5 text-sm" aria-hidden="true">
                      {marker}
                    </span>
                    <span>{explanation}</span>
                  </li>
                );
              })}
            </ul>
          )}

          <ResultCardActions
            result={result}
            feedbackState={feedbackState}
            handleFeedback={handleFeedback}
            isComparing={isComparing}
            onCompareToggle={onCompareToggle}
            disabledCompare={disabledCompare}
          />
        </div>
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
