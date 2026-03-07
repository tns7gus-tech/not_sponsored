"use client";

import { useState } from "react";
import { PLATFORM_LABELS, PLATFORM_COLORS, submitFeedback, type SourceResult } from "@/lib/api";
import ResultDetailModal from "./ResultDetailModal";
import ResultCardActions from "./ResultCardActions";

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
    const platformColor = PLATFORM_COLORS[result.platform] || "#888";
    const isVideo = result.media_types?.includes("video");

    const getTierColor = (tier: string | undefined) => {
        switch (tier) {
            case "S": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
            case "A": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
            case "B": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
            case "F": return "text-red-400 bg-red-400/10 border-red-400/20";
            default: return "text-orange-400 bg-orange-400/10 border-orange-400/20"; // C or null
        }
    };

    const handleFeedback = async (e: React.MouseEvent, type: "helpful" | "ad_suspected") => {
        e.stopPropagation(); // 모달이 뜨는 것을 방지
        if (feedbackState) return; // 이미 피드백을 남긴 경우 무시

        try {
            await submitFeedback(type, result.id, result.url);
            setFeedbackState(type);
        } catch (error) {
            console.error("피드백 제출 실패:", error);
            alert("피드백 등록에 실패했습니다.");
        }
    };

    return (
        <>
            <article
                className="group relative bg-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-800/50 hover:border-gray-600/50 transition-all duration-300 overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                onClick={() => setIsModalOpen(true)}
                role="button"
                tabIndex={0}
                aria-label={`${result.title} 상세 보기`}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setIsModalOpen(true);
                    }
                }}
            >
                {/* 좌측 플랫폼 컬러 바 */}
                <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                    style={{ backgroundColor: platformColor }}
                />

                <div className="p-5 pl-6">
                    {/* 상단: 플랫폼 배지 + 날짜 + Trust Tier */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span
                                className="px-2.5 py-0.5 rounded-md text-xs font-medium border"
                                style={{
                                    color: platformColor,
                                    borderColor: `${platformColor}33`,
                                    backgroundColor: `${platformColor}11`,
                                }}
                            >
                                {isVideo && "🎬 "}
                                {platformLabel}
                            </span>
                            {result.published_at && (
                                <span className="text-gray-500 text-xs">{result.published_at}</span>
                            )}
                        </div>
                        {/* Trust Tier Badge */}
                        {result.tier && (
                            <div className={`px-2 py-0.5 rounded text-xs font-bold border ${getTierColor(result.tier)} flex items-center gap-1`} title={`총 신뢰도 점수: ${result.tss}점`}>
                                <span>Tier {result.tier}</span>
                                <span className="opacity-70 font-normal">({result.tss})</span>
                            </div>
                        )}
                    </div>

                    {/* 제목 */}
                    <h3 className="text-white font-medium text-base leading-relaxed mb-2 group-hover:text-emerald-300 transition-colors">
                        {result.title}
                    </h3>

                    {/* 작성자 */}
                    {result.author_name && (
                        <p className="text-gray-500 text-xs mb-2">
                            <span className="text-gray-600">by</span> {result.author_name}
                        </p>
                    )}

                    {/* 스니펫 */}
                    {result.snippet && (
                        <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 mb-3">
                            {result.snippet}
                        </p>
                    )}

                    {/* 분석 근거 (Explanations) */}
                    {result.explanations && result.explanations.length > 0 && (
                        <div className="mb-4 flex flex-col gap-1.5 mt-2">
                            {result.explanations.map((exp, idx) => (
                                <div key={idx} className="flex items-start gap-1.5 text-xs text-gray-400 bg-gray-800/40 rounded p-1.5 border border-gray-700/50">
                                    <span className={exp.includes('+') ? "text-emerald-400" : exp.includes('-') ? "text-red-400" : "text-gray-500"}>
                                        {exp.includes('+') ? '✓' : exp.includes('-') ? '⚠' : 'ℹ'}
                                    </span>
                                    <span>{exp}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 하단: 피드백, 비교, 원문 보기 버튼 */}
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

            <ResultDetailModal
                result={result}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
