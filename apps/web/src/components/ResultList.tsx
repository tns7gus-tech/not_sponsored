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

  return (
    <div className="mx-auto mt-6 w-full max-w-3xl">
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
        getPlatformCount={(platform) => results.filter((result) => result.platform === platform).length}
      />

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

      <CompareBasket
        compareList={compareList}
        setCompareList={setCompareList}
        setIsCompareModalOpen={setIsCompareModalOpen}
      />

      <CompareModal isOpen={isCompareModalOpen} onClose={() => setIsCompareModalOpen(false)} comparedItems={compareList} />
    </div>
  );
}
