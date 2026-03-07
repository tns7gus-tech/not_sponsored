"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { getSearchResults, type SearchJobDetail } from "@/lib/api";
import SearchProgress from "@/components/SearchProgress";
import ResultList from "@/components/ResultList";

/** 검색 결과 페이지 - 폴링으로 실시간 상태 업데이트 */
export default function SearchResultsPage({
    params,
}: {
    params: Promise<{ jobId: string }>;
}) {
    const { jobId } = use(params);
    const router = useRouter();
    const [data, setData] = useState<SearchJobDetail | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchResults = useCallback(async () => {
        try {
            const result = await getSearchResults(jobId);
            setData(result);
            return result.status;
        } catch {
            setError("결과를 불러오는 데 실패했습니다.");
            return "failed";
        }
    }, [jobId]);

    // 폴링 - 1.5초마다 상태 확인
    useEffect(() => {
        let timer: NodeJS.Timeout;

        const poll = async () => {
            const status = await fetchResults();
            if (status === "queued" || status === "running") {
                timer = setTimeout(poll, 1500);
            }
        };

        poll();
        return () => clearTimeout(timer);
    }, [fetchResults]);

    const isSearching = data?.status === "queued" || data?.status === "running";
    const isDone = data?.status === "completed";
    const isFailed = data?.status === "failed";

    return (
        <main className="min-h-screen px-4 py-8">
            {/* 헤더 */}
            <header className="max-w-3xl mx-auto flex items-center gap-3 mb-8">
                <button
                    onClick={() => router.push("/")}
                    className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <span className="text-sm font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        Not Sponsored
                    </span>
                </div>
                {data?.query && (
                    <div className="ml-4 px-3 py-1 bg-gray-800/60 rounded-lg text-gray-300 text-sm border border-gray-700/30">
                        {data.query}
                    </div>
                )}
            </header>

            {/* 에러 상태 */}
            {(error || isFailed) && (
                <div className="max-w-2xl mx-auto mt-12 text-center">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                        <p className="text-red-400 text-sm mb-2">
                            {error || data?.error_message || "검색 중 오류가 발생했습니다"}
                        </p>
                        <button
                            onClick={() => router.push("/")}
                            className="mt-3 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition"
                        >
                            다시 검색하기
                        </button>
                    </div>
                </div>
            )}

            {/* 검색 진행 중 */}
            {isSearching && data && (
                <SearchProgress
                    query={data.query}
                    expandedQueries={data.expanded_queries || undefined}
                    progress={data.progress || undefined}
                />
            )}

            {/* 검색 완료 - 결과 리스트 */}
            {isDone && data && (
                <>
                    {/* 요약 카드 */}
                    <div className="max-w-3xl mx-auto mb-8 space-y-4">
                        <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-gray-700/40 p-6">
                            <div className="flex items-center justify-between mb-6 border-b border-gray-700/50 pb-4">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-white text-lg font-semibold">
                                        {data.query} 리서치 요약
                                    </h2>
                                    {data.summary?.overall_status === "HIGH_TRUST" && (
                                        <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md text-xs font-bold">
                                            우수 (신뢰도 높음)
                                        </span>
                                    )}
                                    {data.summary?.overall_status === "AD_DENSE" && (
                                        <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-md text-xs font-bold">
                                            주의 (광고 많음)
                                        </span>
                                    )}
                                    {data.summary?.overall_status === "CAUTION" && (
                                        <span className="px-2.5 py-1 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-md text-xs font-bold">
                                            교차 검증 필요
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-400 text-sm">
                                    총 <span className="text-white font-medium">{data.summary?.total_results || 0}</span>건 분석 완료
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* 장단점 요약 */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            주요 장점 / 실사용 인증
                                        </h3>
                                        <ul className="space-y-2">
                                            {data.summary?.pros && data.summary.pros.length > 0 ? (
                                                data.summary.pros.map((pro, i) => (
                                                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                                        <span className="text-emerald-500 mt-0.5">•</span>
                                                        <span className="leading-snug">{pro}</span>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="text-sm text-gray-500">추출된 실사용 장점 신호가 없습니다.</li>
                                            )}
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                            주요 단점 / 아쉬운 점
                                        </h3>
                                        <ul className="space-y-2">
                                            {data.summary?.cons && data.summary.cons.length > 0 ? (
                                                data.summary.cons.map((con, i) => (
                                                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                                        <span className="text-red-500 mt-0.5">•</span>
                                                        <span className="leading-snug">{con}</span>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="text-sm text-gray-500">추출된 단점 신호가 없습니다.</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>

                                {/* 등급 분포 */}
                                <div className="bg-gray-800/30 rounded-xl p-5 border border-gray-700/30">
                                    <h3 className="text-sm font-semibold text-gray-300 mb-4">신뢰도 등급 분포</h3>
                                    <div className="space-y-3.5">
                                        {[
                                            { tier: 'S', label: '매우 높음', color: 'bg-emerald-500' },
                                            { tier: 'A', label: '높음', color: 'bg-blue-500' },
                                            { tier: 'B', label: '보통', color: 'bg-yellow-500' },
                                            { tier: 'C', label: '낮음', color: 'bg-orange-500' },
                                            { tier: 'F', label: '광고 의심', color: 'bg-red-500' }
                                        ].map(({ tier, label, color }) => {
                                            const count = data.summary?.tier_distribution?.[tier] || 0;
                                            const maxCount = Math.max(1, ...(Object.values(data.summary?.tier_distribution || { S: 0, A: 0, B: 0, C: 0, F: 0 }) as number[]));
                                            const percentage = (count / maxCount) * 100;
                                            return (
                                                <div key={tier} className="flex items-center gap-3 text-sm">
                                                    <div className="w-14 items-center flex gap-1">
                                                        <span className="font-bold text-gray-400 w-3">{tier}</span>
                                                    </div>
                                                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                                        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }} />
                                                    </div>
                                                    <div className="w-8 text-right text-gray-300 font-medium">{count}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 결과 리스트 */}
                    <ResultList
                        results={data.results}
                        platforms={data.summary?.platforms || []}
                    />
                </>
            )}

            {/* 하단 면책 */}
            {isDone && (
                <p className="text-center text-gray-600 text-[10px] mt-12 max-w-md mx-auto">
                    이 결과는 AI 기반 자동 수집 및 추정 결과이며, 사실의 확정이 아닙니다.
                    구매 결정 전 원문을 직접 확인하시기 바랍니다.
                </p>
            )}
        </main>
    );
}
