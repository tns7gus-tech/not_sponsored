"use client";

import { useState, useEffect, type FormEvent } from "react";
import { getTrendingSearches } from "@/lib/api";

interface Props {
    onSearch: (query: string) => void;
    isLoading?: boolean;
}

/** 예시 검색어 칩 (Fallback) */
const FALLBACK_QUERIES = [
    "아이폰17",
    "나이키 페가수스 42",
    "쿠션 파운데이션",
    "에어프라이어",
    "갤럭시 S26",
    "건성 피부 선크림",
];

export default function SearchInput({ onSearch, isLoading }: Props) {
    const [query, setQuery] = useState("");
    const [trendingQueries, setTrendingQueries] = useState<string[]>(FALLBACK_QUERIES);

    useEffect(() => {
        async function fetchTrending() {
            const queries = await getTrendingSearches();
            if (queries && queries.length > 0) {
                setTrendingQueries(queries);
            }
        }
        fetchTrending();
    }, []);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const trimmed = query.trim();
        if (trimmed) onSearch(trimmed);
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* 검색 폼 */}
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
                    <div className="relative flex items-center bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-700/50 focus-within:ring-2 focus-within:ring-emerald-500/50 transition-shadow">
                        {/* 검색 아이콘 */}
                        <div className="pl-5 text-gray-400" aria-hidden="true">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="제품명이나 질문을 입력하세요"
                            aria-label="검색어 입력"
                            className="flex-1 px-4 py-4 min-h-[56px] bg-transparent text-white placeholder-gray-500 outline-none text-base sm:text-lg"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={!query.trim() || isLoading}
                            aria-label={isLoading ? "검색 중입니다" : "검색하기"}
                            className="mr-2 px-6 py-2.5 min-h-[44px] bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl disabled:opacity-30 hover:from-emerald-400 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 text-sm"
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
                                "검색"
                            )}
                        </button>
                    </div>
                </div>
            </form>

            {/* 예시 검색어 칩 */}
            <div className="mt-6 flex flex-wrap gap-2.5 justify-center" role="group" aria-label="추천 검색어">
                {trendingQueries.map((eq) => (
                    <button
                        key={eq}
                        type="button"
                        onClick={() => { setQuery(eq); onSearch(eq); }}
                        className="px-4 py-2 min-h-[40px] rounded-full bg-gray-800/60 border border-gray-700/40 text-gray-300 text-sm hover:bg-gray-700/60 hover:text-white hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200"
                        disabled={isLoading}
                    >
                        {eq}
                    </button>
                ))}
            </div>
        </div>
    );
}
