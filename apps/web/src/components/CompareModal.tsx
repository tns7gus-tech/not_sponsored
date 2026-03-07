"use client";

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { type SourceResult, PLATFORM_LABELS, PLATFORM_COLORS } from "@/lib/api";
import { Fragment } from "react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    comparedItems: SourceResult[];
}

export default function CompareModal({ isOpen, onClose, comparedItems }: Props) {
    if (comparedItems.length === 0) return null;

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm transition-opacity" />
                </TransitionChild>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <DialogPanel className="relative transform overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 text-left shadow-2xl transition-all w-full max-w-6xl max-h-[90vh] flex flex-col">
                                <div className="p-6 border-b border-gray-800 flex items-center justify-between shrink-0">
                                    <DialogTitle as="h3" className="text-xl font-semibold leading-6 text-white flex items-center gap-2">
                                        <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        제품 다중 비교
                                    </DialogTitle>
                                    <button
                                        type="button"
                                        className="rounded-lg p-2 text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none transition-colors"
                                        onClick={onClose}
                                    >
                                        <span className="sr-only">닫기</span>
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="p-6 overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
                                    <div className="flex gap-6 min-w-max pb-4">
                                        {comparedItems.map((item) => (
                                            <div key={item.id} className="w-[340px] flex-shrink-0 flex flex-col gap-4 bg-gray-800/30 p-5 rounded-xl border border-gray-700/50 relative overflow-hidden">
                                                <div
                                                    className="absolute top-0 left-0 w-full h-1"
                                                    style={{ backgroundColor: PLATFORM_COLORS[item.platform] || "#888" }}
                                                />
                                                {/* 헤더 */}
                                                <div>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span
                                                            className="px-2 py-0.5 rounded text-[10px] font-medium border"
                                                            style={{
                                                                color: PLATFORM_COLORS[item.platform] || "#888",
                                                                borderColor: `${PLATFORM_COLORS[item.platform] || "#888"}40`,
                                                                backgroundColor: `${PLATFORM_COLORS[item.platform] || "#888"}15`,
                                                            }}
                                                        >
                                                            {PLATFORM_LABELS[item.platform] || item.platform}
                                                        </span>
                                                        {item.tier && (
                                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${item.tier === "S" || item.tier === "A"
                                                                    ? "text-emerald-400 bg-emerald-400/10"
                                                                    : item.tier === "F" ? "text-red-400 bg-red-400/10" : "text-yellow-400 bg-yellow-400/10"
                                                                }`}>
                                                                Tier {item.tier} ({item.tss}점)
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h4 className="text-white font-medium text-base leading-snug line-clamp-2" title={item.title}>
                                                        {item.title}
                                                    </h4>
                                                </div>

                                                <hr className="border-gray-700/50" />

                                                {/* 점수 요약 */}
                                                <div className="space-y-2">
                                                    <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">세부 평가</h5>
                                                    <div className="grid gap-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-400">콘텐츠 신뢰(CRS)</span>
                                                            <span className="text-gray-200 font-medium">{item.crs ?? "-"}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-400">경험 품질(EQS)</span>
                                                            <span className="text-gray-200 font-medium">{item.eqs ?? "-"}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-400">결과물 보강(SCS)</span>
                                                            <span className="text-gray-200 font-medium">{item.scs ?? "-"}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <hr className="border-gray-700/50" />

                                                {/* 장단점/설명 요약 */}
                                                <div className="flex-1 space-y-2">
                                                    <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">주요 평가 근거</h5>
                                                    <div className="flex flex-col gap-2 relative">
                                                        {item.explanations?.map((exp, idx) => (
                                                            <div key={idx} className="flex items-start gap-1.5 text-xs text-gray-300 bg-gray-900/50 rounded p-2">
                                                                <span className={exp.includes('+') ? "text-emerald-400 mt-0.5" : exp.includes('-') ? "text-red-400 mt-0.5" : "text-gray-500 mt-0.5"}>
                                                                    {exp.includes('+') ? '✓' : exp.includes('-') ? '⚠' : 'ℹ'}
                                                                </span>
                                                                <span className="leading-relaxed">{exp}</span>
                                                            </div>
                                                        ))}
                                                        {(!item.explanations || item.explanations.length === 0) && (
                                                            <p className="text-gray-500 text-xs italic">평가 근거가 없습니다.</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* 하단 버튼 */}
                                                <div className="mt-4 pt-4 border-t border-gray-700/50">
                                                    <a
                                                        href={item.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block w-full text-center py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors"
                                                    >
                                                        원문 보러가기
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
