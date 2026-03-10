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
          <div className="fixed inset-0 bg-[#0f172acc]/40 backdrop-blur-sm" />
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
              <DialogPanel className="flex max-h-[86vh] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
                <div className="flex items-start justify-between border-b border-[#eef1f4] px-5 py-4 sm:px-6">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.18em] text-[#8b95a1]">비교 보기</p>
                    <DialogTitle as="h2" className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#191f28]">
                      선택한 결과 비교
                    </DialogTitle>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f4f6] text-[#4e5968] transition hover:bg-[#e9edf2]"
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
                        className="relative flex w-[min(84vw,340px)] flex-shrink-0 flex-col rounded-[28px] border border-[#e5e8eb] bg-[#fafbfc] p-5"
                      >
                        <div
                          className="absolute inset-x-0 top-0 h-1.5 rounded-t-[28px]"
                          style={{ backgroundColor: PLATFORM_COLORS[item.platform] || "#8b95a1" }}
                          aria-hidden="true"
                        />

                        <div className="mt-2 flex items-start justify-between gap-2">
                          <span
                            className="rounded-full px-3 py-1 text-xs font-semibold"
                            style={{
                              color: PLATFORM_COLORS[item.platform] || "#8b95a1",
                              backgroundColor: `${PLATFORM_COLORS[item.platform] || "#8b95a1"}12`,
                            }}
                          >
                            {PLATFORM_LABELS[item.platform] || item.platform}
                          </span>
                          {item.tier && (
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#4e5968]">
                              등급 {item.tier}
                            </span>
                          )}
                        </div>

                        <h3 className="mt-4 text-lg font-semibold leading-7 tracking-[-0.02em] text-[#191f28]">
                          {item.title}
                        </h3>
                        {item.author_name && <p className="mt-2 text-sm text-[#8b95a1]">{item.author_name}</p>}

                        <div className="mt-5 rounded-[22px] bg-white p-4">
                          <h4 className="text-xs font-semibold tracking-[0.18em] text-[#8b95a1]">핵심 수치</h4>
                          <dl className="mt-3 space-y-2 text-sm">
                            <div className="flex items-center justify-between gap-3">
                              <dt className="text-[#6b7684]">총점 (TSS)</dt>
                              <dd className="font-semibold text-[#191f28]">{item.tss ?? "-"}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <dt className="text-[#6b7684]">광고성 차감 (CRS)</dt>
                              <dd className="font-semibold text-[#191f28]">{item.crs ?? "-"}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <dt className="text-[#6b7684]">실사용 가점 (EQS)</dt>
                              <dd className="font-semibold text-[#191f28]">{item.eqs ?? "-"}</dd>
                            </div>
                          </dl>
                        </div>

                        <div className="mt-5 flex-1">
                          <h4 className="text-xs font-semibold tracking-[0.18em] text-[#8b95a1]">주요 근거</h4>
                          <div className="mt-3 space-y-2">
                            {item.explanations && item.explanations.length > 0 ? (
                              item.explanations.slice(0, 4).map((explanation) => (
                                <p key={explanation} className="rounded-[18px] bg-white px-3 py-2 text-sm leading-6 text-[#4e5968]">
                                  {explanation}
                                </p>
                              ))
                            ) : (
                              <p className="text-sm text-[#8b95a1]">표시할 근거가 없습니다.</p>
                            )}
                          </div>
                        </div>

                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-5 inline-flex items-center justify-center rounded-full bg-[#3182f6] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2272eb]"
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
