"use client";

import { useState } from "react";
import { PLATFORM_LABELS, type SourceResult } from "@/lib/api";
import ResultCard from "./ResultCard";

interface Props {
    results: SourceResult[];
    platforms: string[];
}

export default function ResultList({ results, platforms }: Props) {
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

    const filtered = selectedPlatform
        ? results.filter((r) => r.platform === selectedPlatform)
        : results;

    return (
        <div className="w-full max-w-3xl mx-auto mt-6">
            {/* 요약 바 */}
            <div className="flex items-center justify-between mb-6 px-1">
                <p className="text-gray-400 text-sm">
                    총 <span className="text-white font-medium">{results.length}개</span> 결과 수집
                </p>
                <p className="text-gray-500 text-xs">
                    {platforms.length}개 소스에서 검색
                </p>
            </div>

            {/* 플랫폼 필터 */}
            <div className="flex flex-wrap gap-2 mb-6">
                <button
                    onClick={() => setSelectedPlatform(null)}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${!selectedPlatform
                            ? "bg-white/10 border-white/20 text-white"
                            : "bg-gray-800/40 border-gray-700/30 text-gray-500 hover:text-gray-300"
                        }`}
                >
                    전체 ({results.length})
                </button>
                {platforms.map((p) => {
                    const count = results.filter((r) => r.platform === p).length;
                    return (
                        <button
                            key={p}
                            onClick={() => setSelectedPlatform(selectedPlatform === p ? null : p)}
                            className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${selectedPlatform === p
                                    ? "bg-white/10 border-white/20 text-white"
                                    : "bg-gray-800/40 border-gray-700/30 text-gray-500 hover:text-gray-300"
                                }`}
                        >
                            {PLATFORM_LABELS[p] || p} ({count})
                        </button>
                    );
                })}
            </div>

            {/* 결과 카드 리스트 */}
            <div className="space-y-3">
                {filtered.map((result) => (
                    <ResultCard key={result.id} result={result} />
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">결과가 없습니다</p>
                </div>
            )}
        </div>
    );
}
