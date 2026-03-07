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
        <section aria-labelledby="filter-section-title" className="mb-6">
            <h2 id="filter-section-title" className="sr-only">검색 결과 필터 및 정렬</h2>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 px-1">
                {/* 왼쪽: 통계 및 고신뢰도 토글 */}
                <div className="flex items-center gap-4">
                    <p className="text-gray-400 text-sm">
                        총 <span className="text-white font-medium">{totalResults}개</span> 결과
                    </p>
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={showHighTrustOnly}
                                onChange={(e) => setShowHighTrustOnly(e.target.checked)}
                                aria-label="우수 등급(S/A)만 보기 토글"
                            />
                            <div className={`block w-10 h-6 rounded-full transition-colors ${showHighTrustOnly ? 'bg-emerald-500' : 'bg-gray-700'}`} aria-hidden="true"></div>
                            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showHighTrustOnly ? 'translate-x-4' : ''}`} aria-hidden="true"></div>
                        </div>
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                            우수 등급(S/A)만 보기
                        </span>
                    </label>
                </div>

                {/* 오른쪽: 정렬 드롭다운 */}
                <div className="flex items-center gap-2">
                    <label htmlFor="sort-select" className="text-sm text-gray-400">정렬 기준:</label>
                    <select
                        id="sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as "relevance" | "trust")}
                        className="bg-gray-800/80 border border-gray-700 text-sm text-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none pr-8 cursor-pointer relative"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: 'right 0.5rem center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '1.5em 1.5em'
                        }}
                    >
                        <option value="trust">신뢰도 (점수) 높은 순</option>
                        <option value="relevance">관련도 (기본) 순</option>
                    </select>
                </div>
            </div>

            {/* 플랫폼 필터 */}
            <div className="flex flex-wrap gap-2.5" role="group" aria-label="플랫폼 필터">
                <button
                    type="button"
                    onClick={() => setSelectedPlatform(null)}
                    aria-pressed={selectedPlatform === null}
                    className={`px-4 py-2 min-h-[40px] rounded-lg text-sm border font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all ${!selectedPlatform
                            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                            : "bg-gray-800/40 border-gray-700/50 text-gray-400 hover:bg-gray-700/60 hover:text-white"
                        }`}
                >
                    전체 ({totalResults})
                </button>
                {platforms.map((p) => {
                    const count = getPlatformCount(p);
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
                            {platformLabels[p] || p} ({count})
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
