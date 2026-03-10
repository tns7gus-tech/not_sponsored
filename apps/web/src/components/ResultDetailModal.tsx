"use client";

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Fragment } from "react";

import { PLATFORM_COLORS, PLATFORM_LABELS, type SourceResult } from "@/lib/api";
import ResultSignalGroups from "./ResultSignalGroups";

interface Props {
  result: SourceResult;
  isOpen: boolean;
  onClose: () => void;
}

const TIER_COPY: Record<string, string> = {
  S: "근거가 풍부한 편",
  A: "비교적 참고 가능",
  B: "근거가 혼합됨",
  C: "추가 확인 필요",
  F: "광고성 또는 근거 부족 주의",
};

export default function ResultDetailModal({ result, isOpen, onClose }: Props) {
  const platformLabel = PLATFORM_LABELS[result.platform] || result.platform;
  const platformColor = PLATFORM_COLORS[result.platform] || "#8b95a1";

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
              <DialogPanel className="relative w-full max-w-4xl overflow-hidden rounded-[32px] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
                <div
                  className="absolute inset-x-0 top-0 h-1.5"
                  style={{ backgroundColor: platformColor }}
                  aria-hidden="true"
                />

                <div className="border-b border-[#eef1f4] px-5 py-4 sm:px-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span
                        className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                        style={{
                          color: platformColor,
                          backgroundColor: `${platformColor}12`,
                        }}
                      >
                        {platformLabel}
                      </span>
                      <DialogTitle as="h2" className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#191f28]">
                        상세 분석 결과
                      </DialogTitle>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7684]">
                        자동 추정 결과와 근거를 함께 보여줍니다. 최종 판단 전에는 원문과 작성 맥락을 직접 확인하세요.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f4f6] text-[#4e5968] transition hover:bg-[#e9edf2]"
                      aria-label="상세 분석 닫기"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="max-h-[78vh] overflow-y-auto px-5 py-5 sm:px-6">
                  <section className="rounded-[24px] bg-[#fafbfc] p-5">
                    <h3 className="text-xl font-semibold leading-8 tracking-[-0.03em] text-[#191f28]">{result.title}</h3>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-[#8b95a1]">
                      {result.author_name && <span>작성자 {result.author_name}</span>}
                      {result.published_at && <span>작성일 {result.published_at}</span>}
                    </div>
                    {result.snippet && <p className="mt-4 text-sm leading-7 text-[#4e5968]">{result.snippet}</p>}
                  </section>

                  <section className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="rounded-[24px] bg-[#fafbfc] p-5">
                      <p className="text-xs font-semibold tracking-[0.18em] text-[#8b95a1]">신뢰 점수</p>
                      <div className="mt-3 flex items-end gap-2">
                        <span className="text-4xl font-semibold tracking-[-0.04em] text-[#191f28]">{result.tss ?? 0}</span>
                        <span className="pb-1 text-sm text-[#8b95a1]">/ 100</span>
                      </div>
                      <p className="mt-2 text-sm text-[#6b7684]">
                        {result.tier ? `등급 ${result.tier} · ${TIER_COPY[result.tier] || "추가 확인 필요"}` : "등급 데이터 없음"}
                      </p>

                      <div className="mt-5 space-y-4">
                        <div>
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="text-[#6b7684]">광고성 차감(CRS)</span>
                            <span className="font-semibold text-[#191f28]">{result.crs ?? 0}</span>
                          </div>
                          <div className="h-2 rounded-full bg-[#e5e8eb]">
                            <div className="h-2 rounded-full bg-[#8b95a1]" style={{ width: `${result.crs ?? 0}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="text-[#6b7684]">실사용 가점(EQS)</span>
                            <span className="font-semibold text-[#191f28]">{result.eqs ?? 0}</span>
                          </div>
                          <div className="h-2 rounded-full bg-[#e5e8eb]">
                            <div
                              className="h-2 rounded-full bg-[#3182f6]"
                              style={{ width: `${Math.min(result.eqs ?? 0, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[24px] bg-[#fafbfc] p-5">
                      <ResultSignalGroups result={result} title="이 결과에 영향을 준 신호" />
                    </div>
                  </section>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-[#eef1f4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <p className="text-xs leading-5 text-[#8b95a1]">
                    원문 이동 전에도 제휴 링크나 광고 문구는 다시 직접 확인하는 것이 안전합니다.
                  </p>
                  <div className="flex gap-2 self-end">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-full bg-[#f2f4f6] px-4 py-2 text-sm font-semibold text-[#4e5968] transition hover:bg-[#e9edf2]"
                    >
                      닫기
                    </button>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-[#3182f6] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2272eb]"
                    >
                      원문 열기
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
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
