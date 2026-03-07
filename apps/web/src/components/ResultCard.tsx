"use client";

import { PLATFORM_LABELS, PLATFORM_COLORS, type SourceResult } from "@/lib/api";

interface Props {
    result: SourceResult;
}

export default function ResultCard({ result }: Props) {
    const platformLabel = PLATFORM_LABELS[result.platform] || result.platform;
    const platformColor = PLATFORM_COLORS[result.platform] || "#888";
    const isVideo = result.media_types?.includes("video");

    return (
        <div className="group relative bg-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-800/50 hover:border-gray-600/50 transition-all duration-300 overflow-hidden">
            {/* 좌측 플랫폼 컬러 바 */}
            <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                style={{ backgroundColor: platformColor }}
            />

            <div className="p-5 pl-6">
                {/* 상단: 플랫폼 배지 + 날짜 */}
                <div className="flex items-center justify-between mb-3">
                    <span
                        className="px-2.5 py-0.5 rounded-md text-xs font-medium border"
                        style={{
                            color: platformColor,
                            borderColor: `${platformColor}33`,
                            backgroundColor: `${platformColor}11`,
                        }}
                    >
                        {isVideo && "🎬 "}
                        {platformLabel}
                    </span>
                    {result.published_at && (
                        <span className="text-gray-500 text-xs">{result.published_at}</span>
                    )}
                </div>

                {/* 제목 */}
                <h3 className="text-white font-medium text-base leading-relaxed mb-2 group-hover:text-emerald-300 transition-colors">
                    {result.title}
                </h3>

                {/* 작성자 */}
                {result.author_name && (
                    <p className="text-gray-500 text-xs mb-2">
                        <span className="text-gray-600">by</span> {result.author_name}
                    </p>
                )}

                {/* 스니펫 */}
                {result.snippet && (
                    <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 mb-4">
                        {result.snippet}
                    </p>
                )}

                {/* 하단: 원문 보기 버튼 */}
                <div className="flex items-center justify-between mt-2">
                    <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`원문 보기: ${result.title} (새 창에서 열림)`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-400 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-sm transition-colors py-1"
                    >
                        원문 보기
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
}
