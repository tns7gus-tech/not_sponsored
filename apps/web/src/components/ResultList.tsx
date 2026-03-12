"use client";

import { useMemo, useState } from "react";

import { PLATFORM_LABELS, type SourceResult } from "@/lib/api";
import CompareBasket from "./CompareBasket";
import CompareModal from "./CompareModal";
import ResultCard from "./ResultCard";
import ResultFilterBar from "./ResultFilterBar";

interface Props {
  results: SourceResult[];
  platforms: string[];
}

type SortOption = "relevance" | "trust";

export default function ResultList({ results, platforms }: Props) {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("trust");
  const [showHighTrustOnly, setShowHighTrustOnly] = useState(false);
  const [compareList, setCompareList] = useState<SourceResult[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const resetControls = () => {
    setSelectedPlatform(null);
    setSortBy("trust");
    setShowHighTrustOnly(false);
  };

  const handleCompareToggle = (result: SourceResult) => {
    setCompareList((prev) => {
      const exists = prev.some((item) => item.id === result.id);
      if (exists) {
        return prev.filter((item) => item.id !== result.id);
      }

      if (prev.length >= 3) {
        return prev;
      }

      return [...prev, result];
    });
  };

  const processedResults = useMemo(() => {
    let filtered = results;

    if (selectedPlatform) {
      filtered = filtered.filter((result) => result.platform === selectedPlatform);
    }

    if (showHighTrustOnly) {
      filtered = filtered.filter((result) => result.tier === "S" || result.tier === "A");
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === "trust") {
        return (b.tss || 0) - (a.tss || 0);
      }

      return 0;
    });
  }, [results, selectedPlatform, showHighTrustOnly, sortBy]);

  const hasActiveControls = selectedPlatform !== null || showHighTrustOnly || sortBy !== "trust";

  return (
    <div className="mx-auto mt-6 w-full max-w-3xl">
      <ResultFilterBar
        visibleResults={processedResults.length}
        totalResults={results.length}
        showHighTrustOnly={showHighTrustOnly}
        setShowHighTrustOnly={setShowHighTrustOnly}
        sortBy={sortBy}
        setSortBy={setSortBy}
        platforms={platforms}
        selectedPlatform={selectedPlatform}
        setSelectedPlatform={setSelectedPlatform}
        platformLabels={PLATFORM_LABELS}
        getPlatformCount={(platform) => results.filter((result) => result.platform === platform).length}
        hasActiveControls={hasActiveControls}
        onResetControls={resetControls}
      />

      {processedResults.length > 0 ? (
        <ul className="space-y-4 pb-24">
          {processedResults.map((result) => {
            const isComparing = compareList.some((item) => item.id === result.id);
            const disabledCompare = compareList.length >= 3 && !isComparing;

            return (
              <li key={result.id}>
                <ResultCard
                  result={result}
                  isComparing={isComparing}
                  onCompareToggle={() => handleCompareToggle(result)}
                  disabledCompare={disabledCompare}
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <section className="rounded-[28px] border border-[#e5e8eb] bg-white p-8 text-center text-[#4e5968]">
          <h3 className="text-lg font-semibold text-[#191f28]">지금 설정으로는 보여줄 결과가 없습니다</h3>
          <p className="mt-2 text-sm leading-6 text-[#6b7684]">
            플랫폼 필터나 신뢰도 조건을 완화하면 이미 수집된 결과를 다시 볼 수 있습니다.
          </p>
          <button
            type="button"
            onClick={resetControls}
            className="mt-5 rounded-full bg-[#191f28] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2b3441]"
          >
            보기 초기화
          </button>
        </section>
      )}

      <CompareBasket
        compareList={compareList}
        setCompareList={setCompareList}
        setIsCompareModalOpen={setIsCompareModalOpen}
      />

      <CompareModal isOpen={isCompareModalOpen} onClose={() => setIsCompareModalOpen(false)} comparedItems={compareList} />
    </div>
  );
}
