"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { getUrlAnalysis, type UrlAnalysisJobDetail } from "@/lib/api";
import ResultCard from "@/components/ResultCard";

/** 단일 URL 분석 결과 페이지 - 폴링으로 실시간 상태 업데이트 */
export default function AnalyzeResultPage({
    params,
}: {
    params: Promise<{ jobId: string }>;
}) {
    const { jobId } = use(params);
    const router = useRouter();
    const [data, setData] = useState<UrlAnalysisJobDetail | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchResults = useCallback(async () => {
        try {
            const result = await getUrlAnalysis(jobId);
            setData(result);
            return result.status;
        } catch {
            setError("분석 결과를 불러오는 데 실패했습니다.");
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

    const isAnalyzing = data?.status === "queued" || data?.status === "running";
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
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                    </div>
                    <span className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        URL Analyzer
                    </span>
                </div>
                {data?.url && (
                    <div className="ml-4 px-3 py-1 bg-gray-800/60 rounded-lg text-gray-300 text-sm border border-gray-700/30 truncate max-w-sm">
                        {data.url}
                    </div>
                )}
            </header>

            {/* 에러 상태 */}
            {(error || isFailed) && (
                <div className="max-w-2xl mx-auto mt-12 text-center">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                        <p className="text-red-400 text-sm mb-2">
                            {error || data?.error_message || "분석 중 오류가 발생했습니다"}
                        </p>
                        <button
                            onClick={() => router.push("/")}
                            className="mt-3 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition"
                        >
                            돌아가기
                        </button>
                    </div>
                </div>
            )}

            {/* 분석 진행 중 */}
            {isAnalyzing && data && (
                <div className="max-w-2xl mx-auto mt-20 text-center">
                    <div className="inline-block p-4 rounded-full bg-gray-800/50 mb-6">
                        <svg className="animate-spin h-8 w-8 text-purple-400" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">대상 URL 실시간 분석 중...</h2>
                    <p className="text-gray-400 text-sm">해당 링크의 본문을 스크래핑하여 광고성 및 신뢰도를 검증하고 있습니다.</p>
                </div>
            )}

            {/* 분석 완료 - 결과 카드 하나만 렌더링 */}
            {isDone && data?.result && (
                <div className="max-w-2xl mx-auto mt-6">
                    <h2 className="text-white text-lg font-semibold mb-6">분석 결과</h2>
                    <ResultCard result={data.result} />
                </div>
            )}

            {/* 하단 면책 */}
            {isDone && (
                <p className="text-center text-gray-600 text-[10px] mt-12 max-w-md mx-auto">
                    이 분석 결과는 AI에 의한 자동 평가일 뿐, 사실의 확정이 아닙니다.
                </p>
            )}
        </main>
    );
}
