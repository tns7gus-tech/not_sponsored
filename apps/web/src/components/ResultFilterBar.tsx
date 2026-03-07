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
    <section
      aria-labelledby="filter-section-title"
      className="mb-6 rounded-[26px] border border-white/8 bg-[rgba(7,14,26,0.72)] p-4 shadow-[0_18px_50px_rgba(4,10,20,0.16)] backdrop-blur-xl sm:p-5"
    >
      <h2 id="filter-section-title" className="sr-only">
        검색 결과 필터와 정렬
      </h2>

      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <p className="text-sm text-slate-400">
            총 <span className="font-semibold text-white">{totalResults}개</span> 결과
          </p>

          <label className="group inline-flex cursor-pointer items-center gap-3">
            <span className="text-sm font-medium text-slate-300 transition group-hover:text-white">
              고신뢰 등급만 보기
            </span>
            <span className="relative inline-flex items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={showHighTrustOnly}
                onChange={(e) => setShowHighTrustOnly(e.target.checked)}
                aria-label="고신뢰 등급 필터 켜기"
              />
              <span
                className="block h-6 w-11 rounded-full bg-slate-700 transition peer-checked:bg-emerald-500"
                aria-hidden="true"
              />
              <span
                className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5"
                aria-hidden="true"
              />
            </span>
          </label>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label htmlFor="sort-select" className="text-sm text-slate-400">
            정렬 기준
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "relevance" | "trust")}
            className="min-h-11 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 pr-10 text-sm text-slate-100 outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/30"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")",
              backgroundPosition: "right 0.75rem center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "1.25rem 1.25rem",
            }}
          >
            <option value="trust">신뢰도 높은 순</option>
            <option value="relevance">관련도 순</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5" role="group" aria-label="플랫폼 필터">
        <button
          type="button"
          onClick={() => setSelectedPlatform(null)}
          aria-pressed={selectedPlatform === null}
          className={`min-h-11 rounded-full border px-4 py-2 text-sm font-medium transition ${
            selectedPlatform === null
              ? "border-emerald-400/40 bg-emerald-400/14 text-emerald-200"
              : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white"
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
              className={`min-h-11 rounded-full border px-4 py-2 text-sm font-medium transition ${
                selectedPlatform === platform
                  ? "border-cyan-300/40 bg-cyan-300/14 text-cyan-100"
                  : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white"
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
