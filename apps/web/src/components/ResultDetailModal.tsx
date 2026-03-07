"use client";

import { useEffect } from "react";
import { type SourceResult, PLATFORM_LABELS, PLATFORM_COLORS } from "@/lib/api";

interface Props {
    result: SourceResult;
    isOpen: boolean;
    onClose: () => void;
}

export default function ResultDetailModal({ result, isOpen, onClose }: Props) {
    // 키보드 이벤트(ESC)로 닫기
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
            // 줌 방지 및 스크롤 고정
            document.body.style.overflow = "hidden";
        }
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const platformLabel = PLATFORM_LABELS[result.platform] || result.platform;
    const platformColor = PLATFORM_COLORS[result.platform] || "#888";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:p-6">
            {/* 백드롭 */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* 빙글빙글 모달 컨테이너 */}
            <div
                className="relative w-full max-w-2xl bg-gray-900 border border-gray-700/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* 상단 헤더 + 플랫폼 컬러바 */}
                <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: platformColor }}
                />

                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <span
                            className="px-2.5 py-0.5 rounded-md text-xs font-medium border"
                            style={{
                                color: platformColor,
                                borderColor: `${platformColor}33`,
                                backgroundColor: `${platformColor}11`,
                            }}
                        >
                            {platformLabel}
                        </span>
                        <h2 id="modal-title" className="text-white font-semibold text-lg line-clamp-1">
                            상세 분석 결과
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                        aria-label="닫기"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 스크롤 가능한 콘텐츠 영역 */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* 1. 기본 정보 */}
                    <section>
                        <h3 className="text-xl font-medium text-white mb-2 leading-relaxed">
                            {result.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                            {result.author_name && <span>✍️ {result.author_name}</span>}
                            {result.published_at && <span>📅 {result.published_at}</span>}
                        </div>
                        {result.snippet && (
                            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                                <p className="text-sm text-gray-300 leading-relaxed indent-2">
                                    &quot;{result.snippet}&quot;
                                </p>
                            </div>
                        )}
                    </section>

                    {/* 2. 신뢰도 점수 및 등급 */}
                    <section>
                        <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            신뢰도 스코어 보드
                        </h4>

                        <div className="grid grid-cols-3 gap-4">
                            {/* 총점 (TSS) */}
                            <div className="col-span-3 sm:col-span-1 bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl border border-gray-700 flex flex-col items-center justify-center text-center">
                                <span className="text-xs text-gray-400 font-medium mb-1">총 신뢰도 점수 (TSS)</span>
                                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-1">
                                    {result.tss ?? 0}
                                    <span className="text-sm text-gray-500 font-normal ml-1">/ 100</span>
                                </div>
                                <span className="px-2 py-0.5 bg-gray-800 rounded text-xs font-bold text-gray-300">
                                    Tier {result.tier || 'C'}
                                </span>
                            </div>

                            {/* 세부 수치 (CRS & EQS) */}
                            <div className="col-span-3 sm:col-span-2 grid grid-cols-2 gap-4">
                                <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50 flex flex-col justify-center">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-gray-400 font-medium">콘텐츠 신뢰성 (CRS)</span>
                                        <span className="text-sm font-bold text-white">{result.crs ?? 0}/100</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                                        <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${result.crs ?? 0}%` }} />
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-2">
                                        광고/협찬 의심 표현 배제 점수
                                    </p>
                                </div>
                                <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50 flex flex-col justify-center">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-gray-400 font-medium">경험 품질 (EQS)</span>
                                        <span className="text-sm font-bold text-white">{result.eqs ?? 0}/100</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                                        <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${Math.min(result.eqs ?? 0, 100)}%` }} />
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-2">
                                        실사용 후기/단점 언급 등 경험치 가점
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 3. 분석 근거 상세 내역 */}
                    <section>
                        <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            점수 산출 근거
                        </h4>
                        {result.explanations && result.explanations.length > 0 ? (
                            <ul className="space-y-2">
                                {result.explanations.map((exp, idx) => {
                                    const isPositive = exp.includes('+');
                                    const isNegative = exp.includes('-');
                                    return (
                                        <li key={idx} className={`p-3 rounded-lg border flex items-start gap-3 ${isPositive ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-100' :
                                            isNegative ? 'bg-red-500/5 border-red-500/10 text-red-100' :
                                                'bg-gray-800/30 border-gray-700/50 text-gray-300'
                                            }`}>
                                            <span className={`text-base leading-none mt-0.5 ${isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-gray-500'
                                                }`}>
                                                {isPositive ? '✓' : isNegative ? '⚠' : 'ℹ'}
                                            </span>
                                            <span className="text-sm">{exp}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className="text-center p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                                <p className="text-sm text-gray-500">특출난 광고 패턴이나 실사용 증거가 발견되지 않았습니다.</p>
                            </div>
                        )}
                    </section>

                </div>

                {/* 하단 푸터 (강조된 원문 이동 액션) */}
                <div className="p-4 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                        닫기
                    </button>
                    <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2 rounded-lg text-sm font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors flex items-center gap-2"
                    >
                        원본 페이지로 이동
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
}
