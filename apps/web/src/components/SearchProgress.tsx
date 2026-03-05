"use client";

/** 검색 진행 중 상태 표시 컴포넌트 */
interface Props {
    query: string;
    expandedQueries?: string[];
    progress?: {
        connectors_done: number;
        connectors_total: number;
        results_collected: number;
    };
}

export default function SearchProgress({ query, expandedQueries, progress }: Props) {
    return (
        <div className="w-full max-w-2xl mx-auto mt-12">
            {/* 메인 로딩 인디케이터 */}
            <div className="relative bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-gray-700/40 p-8">
                {/* 펄스 애니메이션 */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="relative flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500" />
                    </div>
                    <p className="text-white text-lg font-medium">
                        <span className="text-emerald-400">{query}</span>을(를) 조사하는 중...
                    </p>
                </div>

                {/* 확장된 질의 표시 */}
                {expandedQueries && expandedQueries.length > 0 && (
                    <div className="mb-6">
                        <p className="text-gray-400 text-sm mb-3">생성된 검색 질의</p>
                        <div className="flex flex-wrap gap-2">
                            {expandedQueries.slice(0, 10).map((q, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1 bg-gray-800/60 rounded-lg text-gray-300 text-xs border border-gray-700/30 animate-fade-in"
                                    style={{ animationDelay: `${i * 100}ms` }}
                                >
                                    {q}
                                </span>
                            ))}
                            {expandedQueries.length > 10 && (
                                <span className="px-3 py-1 text-gray-500 text-xs">
                                    +{expandedQueries.length - 10}개 더
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* 소스 진행 상태 */}
                <div className="mb-4">
                    <p className="text-gray-400 text-sm mb-3">검색 소스</p>
                    <div className="flex flex-wrap gap-3">
                        {["NAVER 블로그", "NAVER 카페", "NAVER 뉴스", "NAVER 쇼핑", "YouTube"].map((src, i) => {
                            const done = progress ? i < progress.connectors_done : false;
                            return (
                                <div
                                    key={src}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border transition-all duration-500 ${done
                                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                            : "bg-gray-800/40 border-gray-700/30 text-gray-500"
                                        }`}
                                >
                                    {done ? (
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    )}
                                    {src}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 수집 결과 카운트 */}
                {progress && progress.results_collected > 0 && (
                    <p className="text-gray-500 text-sm">
                        현재 <span className="text-cyan-400 font-medium">{progress.results_collected}개</span>의 후보 결과를 분석 중...
                    </p>
                )}

                {/* 프로그레스 바 */}
                <div className="mt-4 w-full bg-gray-800 rounded-full h-1.5">
                    <div
                        className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-1.5 rounded-full transition-all duration-1000"
                        style={{
                            width: progress
                                ? `${(progress.connectors_done / Math.max(progress.connectors_total, 1)) * 100}%`
                                : "15%",
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
