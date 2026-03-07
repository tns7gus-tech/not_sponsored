"use client";

import { useEffect, useState } from "react";

export interface SearchHistoryItem {
    query: string;
    jobId: string;
    timestamp: number;
}

interface Props {
    onHistoryClick: (query: string, jobId: string) => void;
}

export default function SearchHistory({ onHistoryClick }: Props) {
    const [history, setHistory] = useState<SearchHistoryItem[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem("not_sponsored_history");
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as SearchHistoryItem[];
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setHistory(parsed);
            } catch {
                // Ignore parse errors
            }
        }
    }, []);

    const clearHistory = () => {
        localStorage.removeItem("not_sponsored_history");
        setHistory([]);
    };

    if (history.length === 0) return null;

    return (
        <div className="w-full max-w-2xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    최근 본 리서치
                </h3>
                <button
                    onClick={clearHistory}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                    전체 삭제
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {history.map((item) => (
                    <button
                        key={item.jobId}
                        onClick={() => onHistoryClick(item.query, item.jobId)}
                        className="group flex items-center gap-2 px-4 py-2 bg-gray-800/40 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    >
                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                            {item.query}
                        </span>
                        <span className="text-[10px] text-gray-600">
                            {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
