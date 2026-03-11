export interface ResultFilterBarProps {
  totalResults: number;
  showHighTrustOnly: boolean;
  setShowHighTrustOnly: (val: boolean) => void;
  sortBy: "relevance" | "trust";
  setSortBy: (val: "relevance" | "trust") => void;
  platforms: string[];
  selectedPlatform: string | null;
  setSelectedPlatform: (val: string | null) => void;
  platformLabels: Record<string, string>;
  getPlatformCount: (p: string) => number;
}

export default function ResultFilterBar({
  totalResults,
  showHighTrustOnly,
  setShowHighTrustOnly,
  sortBy,
  setSortBy,
  platforms,
  selectedPlatform,
  setSelectedPlatform,
  platformLabels,
  getPlatformCount,
}: ResultFilterBarProps) {
  return (
    <section aria-labelledby="filter-section-title" className="mb-6 rounded-[28px] border border-[#e5e8eb] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <h2 id="filter-section-title" className="sr-only">
        검색 결과 필터와 정렬
      </h2>

      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <p className="text-sm text-[#6b7684]">
            현재 <span className="font-semibold text-[#191f28]">{totalResults}개</span> 결과
          </p>

          <label className="group inline-flex cursor-pointer items-center gap-3">
            <span className="text-sm font-medium text-[#4e5968]">신뢰도가 높은 결과만 보기</span>
            <span className="relative inline-flex items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={showHighTrustOnly}
                onChange={(event) => setShowHighTrustOnly(event.target.checked)}
                aria-label="신뢰도가 높은 결과만 보기"
              />
              <span className="block h-6 w-11 rounded-full bg-[#d1d6db] transition peer-checked:bg-[#3182f6]" aria-hidden="true" />
              <span
                className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5"
                aria-hidden="true"
              />
            </span>
          </label>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label htmlFor="sort-select" className="text-sm text-[#6b7684]">
            정렬 기준
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as "relevance" | "trust")}
            className="min-h-11 rounded-full border border-[#e5e8eb] bg-[#fafbfc] px-4 py-2 pr-10 text-sm text-[#191f28] outline-none transition focus:border-[#3182f6] focus:ring-4 focus:ring-[#3182f61f]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%238b95a1' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")",
              backgroundPosition: "right 0.75rem center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "1.25rem 1.25rem",
            }}
          >
            <option value="trust">신뢰도 높은 순</option>
            <option value="relevance">기본 순서</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5" role="group" aria-label="플랫폼 필터">
        <button
          type="button"
          onClick={() => setSelectedPlatform(null)}
          aria-pressed={selectedPlatform === null}
          className={`min-h-11 rounded-full px-4 py-2 text-sm font-semibold transition ${
            selectedPlatform === null
              ? "bg-[#eef4ff] text-[#3182f6]"
              : "bg-[#f2f4f6] text-[#4e5968] hover:bg-[#e9edf2]"
          }`}
        >
          전체 ({totalResults})
        </button>

        {platforms.map((platform) => {
          const count = getPlatformCount(platform);

          return (
            <button
              key={platform}
              type="button"
              onClick={() => setSelectedPlatform(selectedPlatform === platform ? null : platform)}
              aria-pressed={selectedPlatform === platform}
              className={`min-h-11 rounded-full px-4 py-2 text-sm font-semibold transition ${
                selectedPlatform === platform
                  ? "bg-[#eef4ff] text-[#3182f6]"
                  : "bg-[#f2f4f6] text-[#4e5968] hover:bg-[#e9edf2]"
              }`}
            >
              {platformLabels[platform] || platform} ({count})
            </button>
          );
        })}
      </div>
    </section>
  );
}
