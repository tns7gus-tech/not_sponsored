"use client";

import { useState, useMemo } from "react";
import { PLATFORM_LABELS, type SourceResult } from "@/lib/api";
import ResultCard from "./ResultCard";
import CompareModal from "./CompareModal";
import ResultFilterBar from "./ResultFilterBar";
import CompareBasket from "./CompareBasket";

interface Props {
    results: SourceResult[];
    platforms: string[];
}

type SortOption = "relevance" | "trust";

export default function ResultList({ results, platforms }: Props) {
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>("trust");
    const [showHighTrustOnly, setShowHighTrustOnly] = useState(false);

    // 비교 장바구니 상태
    const [compareList, setCompareList] = useState<SourceResult[]>([]);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

    const handleCompareToggle = (result: SourceResult) => {
        setCompareList(prev => {
            const isExist = prev.some(item => item.id === result.id);
            if (isExist) {
                return prev.filter(item => item.id !== result.id);
            } else {
                if (prev.length >= 3) return prev; // 최대 3개
                return [...prev, result];
            }
        });
    };

    const processedResults = useMemo(() => {
        let filtered = results;

        // 1. 플랫폼 필터
        if (selectedPlatform) {
            filtered = filtered.filter((r) => r.platform === selectedPlatform);
        }

        // 2. 고신뢰도(S/A) 필터
        if (showHighTrustOnly) {
            filtered = filtered.filter((r) => r.tier === "S" || r.tier === "A");
        }

        // 3. 정렬
        return [...filtered].sort((a, b) => {
            if (sortBy === "trust") {
                // TSS 높은 순 (단, 내림차순)
                return (b.tss || 0) - (a.tss || 0);
            }
            // relevance: 원본 배열 유지 (API에서 이미 섞어뒀으므로 기본 정렬 사용)
            return 0;
        });
    }, [results, selectedPlatform, sortBy, showHighTrustOnly]);

    return (
        <div className="w-full max-w-3xl mx-auto mt-6">
            {/* 필터 및 정렬 바 */}
            <ResultFilterBar
                totalResults={processedResults.length}
                showHighTrustOnly={showHighTrustOnly}
                setShowHighTrustOnly={setShowHighTrustOnly}
                sortBy={sortBy}
                setSortBy={setSortBy}
                platforms={platforms}
                selectedPlatform={selectedPlatform}
                setSelectedPlatform={setSelectedPlatform}
                platformLabels={PLATFORM_LABELS}
                getPlatformCount={(p) => results.filter((r) => r.platform === p).length}
            />

            {/* 결과 카드 리스트 */}
            <ul className="space-y-4 pb-24">
                {processedResults.map((result) => {
                    const isComparing = compareList.some((c) => c.id === result.id);
                    const disabledCompare = compareList.length >= 3;
                    return (
                        <li key={result.id}>
                            <ResultCard
                                result={result}
                                isComparing={isComparing}
                                onCompareToggle={() => handleCompareToggle(result)}
                                disabledCompare={disabledCompare}
                            />
                        </li>
                    )
                })}
            </ul>

            {/* 비교함 (Floating Action Basket) */}
            <CompareBasket
                compareList={compareList}
                setCompareList={setCompareList}
                setIsCompareModalOpen={setIsCompareModalOpen}
            />

            {/* 대조 모달 */}
            <CompareModal
                isOpen={isCompareModalOpen}
                onClose={() => setIsCompareModalOpen(false)}
                comparedItems={compareList}
            />
        </div>
    );
}
