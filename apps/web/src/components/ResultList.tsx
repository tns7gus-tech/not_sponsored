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
            <div className="flex flex-wrap gap-2.5 mb-6" role="group" aria-label="플랫폼 필터">
                <button
                    type="button"
                    onClick={() => setSelectedPlatform(null)}
                    aria-pressed={selectedPlatform === null}
                    className={`px-4 py-2 min-h-[40px] rounded-lg text-sm border font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all ${!selectedPlatform
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                        : "bg-gray-800/40 border-gray-700/50 text-gray-400 hover:bg-gray-700/60 hover:text-white"
                        }`}
                >
                    전체 ({results.length})
                </button>
                {platforms.map((p) => {
                    const count = results.filter((r) => r.platform === p).length;
                    return (
                        <button
                            key={p}
                            type="button"
                            onClick={() => setSelectedPlatform(selectedPlatform === p ? null : p)}
                            aria-pressed={selectedPlatform === p}
                            className={`px-4 py-2 min-h-[40px] rounded-lg text-sm border font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all ${selectedPlatform === p
                                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                                : "bg-gray-800/40 border-gray-700/50 text-gray-400 hover:bg-gray-700/60 hover:text-white"
                                }`}
                        >
                            {PLATFORM_LABELS[p] || p} ({count})
                        </button>
                    );
                })}
            </div>

            {/* 결과 카드 리스트 */}
            <ul className="space-y-4">
                {filtered.map((result) => (
                    <li key={result.id}>
                        <ResultCard result={result} />
                    </li>
                ))}
            </ul>

            {filtered.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">결과가 없습니다</p>
                </div>
            )}
        </div>
    );
}
