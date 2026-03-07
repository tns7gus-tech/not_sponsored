"use client";

import { useState, type FormEvent } from "react";

interface Props {
    onAnalyze: (url: string) => void;
    isLoading?: boolean;
}

export default function UrlAnalyzerInput({ onAnalyze, isLoading }: Props) {
    const [url, setUrl] = useState("");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const trimmed = url.trim();
        if (trimmed) onAnalyze(trimmed);
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* 검색 폼 */}
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
                    <div className="relative flex items-center bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-700/50 focus-within:ring-2 focus-within:ring-purple-500/50 transition-shadow">
                        {/* 앵커 아이콘 */}
                        <div className="pl-5 text-gray-400" aria-hidden="true">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </div>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="분석할 블로그/카페/웹사이트 링크(URL)를 입력하세요"
                            aria-label="URL 입력"
                            className="flex-1 px-4 py-4 min-h-[56px] bg-transparent text-white placeholder-gray-500 outline-none text-base sm:text-lg"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={!url.trim() || isLoading}
                            aria-label={isLoading ? "분석 중입니다" : "분석하기"}
                            className="mr-2 px-6 py-2.5 min-h-[44px] bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl disabled:opacity-30 hover:from-purple-400 hover:to-pink-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 text-sm"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    분석 중
                                </span>
                            ) : (
                                "분석"
                            )}
                        </button>
                    </div>
                </div>
            </form>

            <div className="mt-6 flex justify-center">
                <p className="text-gray-500 text-sm flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    특정 게시글 1개만 정밀하게 분석하여 결과를 직접 제공합니다.
                </p>
            </div>
        </div>
    );
}
