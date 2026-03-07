"use client";

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Fragment } from "react";

import { PLATFORM_COLORS, PLATFORM_LABELS, type SourceResult } from "@/lib/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  comparedItems: SourceResult[];
}

export default function CompareModal({ isOpen, onClose, comparedItems }: Props) {
  if (comparedItems.length === 0) {
    return null;
  }

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6">
          <div className="flex min-h-full items-end justify-center sm:items-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="translate-y-3 opacity-0 sm:translate-y-0 sm:scale-95"
              enterTo="translate-y-0 opacity-100 sm:scale-100"
              leave="ease-in duration-150"
              leaveFrom="translate-y-0 opacity-100 sm:scale-100"
              leaveTo="translate-y-3 opacity-0 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel className="flex max-h-[86vh] w-full max-w-6xl flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[rgba(9,17,29,0.95)] shadow-[0_32px_90px_rgba(4,10,20,0.45)] backdrop-blur-xl">
                <div className="flex items-start justify-between border-b border-white/8 px-5 py-4 sm:px-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Compare View</p>
                    <DialogTitle as="h2" className="mt-2 text-2xl font-semibold text-white">
                      선택한 결과 비교
                    </DialogTitle>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                    aria-label="비교 보기 닫기"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="flex-1 overflow-auto px-5 py-5 sm:px-6">
                  <div className="flex min-w-max gap-4 pb-2">
                    {comparedItems.map((item) => (
                      <article
                        key={item.id}
                        className="relative flex w-[min(84vw,340px)] flex-shrink-0 flex-col rounded-[26px] border border-white/10 bg-white/5 p-5"
                      >
                        <div
                          className="absolute inset-x-0 top-0 h-1.5 rounded-t-[26px]"
                          style={{ backgroundColor: PLATFORM_COLORS[item.platform] || "#94a3b8" }}
                          aria-hidden="true"
                        />

                        <div className="mt-2 flex items-start justify-between gap-2">
                          <span
                            className="rounded-full border px-3 py-1 text-xs font-medium"
                            style={{
                              color: PLATFORM_COLORS[item.platform] || "#94a3b8",
                              borderColor: `${PLATFORM_COLORS[item.platform] || "#94a3b8"}33`,
                              backgroundColor: `${PLATFORM_COLORS[item.platform] || "#94a3b8"}14`,
                            }}
                          >
                            {PLATFORM_LABELS[item.platform] || item.platform}
                          </span>
                          {item.tier && (
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                              Tier {item.tier}
                            </span>
                          )}
                        </div>

                        <h3 className="mt-4 text-lg font-semibold leading-7 text-white">{item.title}</h3>
                        {item.author_name && <p className="mt-2 text-sm text-slate-400">{item.author_name}</p>}

                        <div className="mt-5 rounded-[22px] border border-white/8 bg-slate-950/40 p-4">
                          <h4 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">핵심 수치</h4>
                          <dl className="mt-3 space-y-2 text-sm">
                            <div className="flex items-center justify-between gap-3">
                              <dt className="text-slate-300">총점 (TSS)</dt>
                              <dd className="font-medium text-white">{item.tss ?? "-"}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <dt className="text-slate-300">광고성 차감 (CRS)</dt>
                              <dd className="font-medium text-white">{item.crs ?? "-"}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <dt className="text-slate-300">실사용 가점 (EQS)</dt>
                              <dd className="font-medium text-white">{item.eqs ?? "-"}</dd>
                            </div>
                          </dl>
                        </div>

                        <div className="mt-5 flex-1">
                          <h4 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">주요 근거</h4>
                          <div className="mt-3 space-y-2">
                            {item.explanations && item.explanations.length > 0 ? (
                              item.explanations.slice(0, 4).map((explanation) => (
                                <p key={explanation} className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-sm leading-6 text-slate-200">
                                  {explanation}
                                </p>
                              ))
                            ) : (
                              <p className="text-sm text-slate-400">표시할 근거가 없습니다.</p>
                            )}
                          </div>
                        </div>

                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-5 inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                        >
                          원문 보기
                        </a>
                      </article>
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
