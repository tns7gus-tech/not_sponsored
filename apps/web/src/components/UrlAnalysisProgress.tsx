"use client";

import { useEffect, useState } from "react";

interface Props {
  url?: string;
}

const ANALYSIS_STEPS = [
  { label: "공개 주소 확인", description: "로그인 필요 페이지가 아닌지, 공개 페이지인지 먼저 확인합니다." },
  { label: "보안 경계 검사", description: "차단 대상 경로와 비표준 포트를 제외합니다." },
  { label: "본문 추출", description: "비교 가능한 본문과 제목, 메타 설명을 추출합니다." },
  { label: "광고성 신호 탐색", description: "제공 문구와 링크 유도 표현을 확인합니다." },
  { label: "카드 정리", description: "주의 신호와 근거를 카드 형태로 정리합니다." },
] as const;

export default function UrlAnalysisProgress({ url }: Props) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveStep((current) => Math.min(current + 1, ANALYSIS_STEPS.length - 1));
    }, 1400);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const percentage = 18 + activeStep * 18;
  const currentStep = ANALYSIS_STEPS[activeStep];

  return (
    <section
      aria-live="polite"
      aria-busy="true"
      className="mx-auto mt-10 max-w-4xl rounded-[32px] border border-[#e5e8eb] bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.06)] sm:p-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#6b7684]">공개 URL 분석</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#191f28]">공개 URL을 안전하게 읽고 있어요</h2>
        </div>
        <span className="self-start rounded-full bg-[#eef4ff] px-4 py-2 text-sm font-semibold text-[#3182f6]">
          {currentStep.label}
        </span>
      </div>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6b7684]">{currentStep.description}</p>

      {url && (
        <div className="mt-4 rounded-[20px] bg-[#fafbfc] px-4 py-3 text-sm text-[#4e5968]">
          <span className="mr-2 text-[#8b95a1]">대상 URL</span>
          <span className="break-all">{url}</span>
        </div>
      )}

      <ol className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {ANALYSIS_STEPS.map((step, index) => {
          const state = index < activeStep ? "done" : index === activeStep ? "current" : "upcoming";
          const cardClassName =
            state === "done"
              ? "border-[#dbeafe] bg-[#f5f9ff]"
              : state === "current"
                ? "border-[#bfdbfe] bg-[#eef4ff]"
                : "border-[#eef1f4] bg-[#fafbfc]";

          const badgeClassName =
            state === "done"
              ? "bg-[#3182f6] text-white"
              : state === "current"
                ? "bg-[#dbeafe] text-[#3182f6]"
                : "bg-[#f2f4f6] text-[#8b95a1]";

          return (
            <li key={step.label} className={`rounded-[24px] border p-4 ${cardClassName}`}>
              <div className="flex items-center gap-2">
                <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${badgeClassName}`}>
                  {index + 1}
                </span>
                <p className="text-sm font-semibold text-[#191f28]">{step.label}</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#6b7684]">{step.description}</p>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 rounded-[24px] bg-[#fafbfc] p-5">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          <span className="text-[#6b7684]">진행률</span>
          <span className="font-semibold text-[#191f28]">{Math.min(percentage, 92)}%</span>
        </div>
        <div className="h-2 rounded-full bg-[#e5e8eb]">
          <div
            className="h-2 rounded-full bg-[#3182f6] transition-all duration-700"
            style={{ width: `${Math.min(percentage, 92)}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-[#6b7684]">본문 전체를 복제하지 않고 요약 가능한 본문과 신호만 추출합니다.</p>
      </div>
    </section>
  );
}
