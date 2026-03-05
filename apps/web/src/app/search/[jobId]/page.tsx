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
                    <div className="max-w-3xl mx-auto mb-6">
                        <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-gray-700/40 p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-white text-lg font-semibold">
                                    {data.query} 리서치 결과
                                </h2>
                                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md text-xs">
                                    완료
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm">
                                {data.summary?.platforms.length || 0}개 소스에서{" "}
                                <span className="text-white font-medium">{data.summary?.total_results || 0}개</span>의 결과를 수집했습니다
                            </p>
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
