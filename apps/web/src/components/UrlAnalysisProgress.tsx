"use client";

import { useEffect, useState } from "react";

interface Props {
  url?: string;
}

const ANALYSIS_STEPS = [
  {
    label: "공개 주소 확인 중",
    description: "로그인 필요 페이지나 내부망 주소인지 먼저 확인합니다.",
  },
  {
    label: "보안 경계 검사 중",
    description: "비표준 포트, 비공개 영역, 차단 대상 경로를 제외합니다.",
  },
  {
    label: "본문 요약 추출 중",
    description: "HTML에서 비교 가능한 본문과 제목, 작성 시점 단서를 읽습니다.",
  },
  {
    label: "광고성 표현 탐색 중",
    description: "협찬 문구, 링크 삽입, 과도한 CTA 같은 신호를 찾습니다.",
  },
  {
    label: "결과 카드 정리 중",
    description: "긍정 신호와 주의 신호를 묶어 카드 형태로 보여줄 준비를 합니다.",
  },
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
      className="mx-auto mt-16 max-w-3xl rounded-[30px] border border-white/10 bg-[rgba(9,17,29,0.78)] p-6 shadow-[0_24px_72px_rgba(4,10,20,0.28)] backdrop-blur-xl sm:p-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-slate-400">단일 URL 분석</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">공개 URL을 안전하게 분석하는 중입니다</h2>
        </div>
        <span className="self-start rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10 px-3 py-1 text-xs font-medium text-fuchsia-100">
          {currentStep.label}
        </span>
      </div>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{currentStep.description}</p>

      {url && (
        <div className="mt-4 rounded-2xl border border-white/8 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
          <span className="mr-2 text-slate-500">대상 URL</span>
          <span className="break-all">{url}</span>
        </div>
      )}

      <ol className="mt-6 grid gap-3 sm:grid-cols-2">
        {ANALYSIS_STEPS.map((step, index) => {
          const state = index < activeStep ? "done" : index === activeStep ? "current" : "upcoming";
          const cardClassName =
            state === "done"
              ? "border-fuchsia-300/16 bg-fuchsia-300/10"
              : state === "current"
                ? "border-cyan-300/20 bg-cyan-300/10"
                : "border-white/8 bg-white/5";

          return (
            <li key={step.label} className={`rounded-2xl border p-4 ${cardClassName}`}>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                    state === "done"
                      ? "bg-fuchsia-300/20 text-fuchsia-100"
                      : state === "current"
                        ? "bg-cyan-300/20 text-cyan-100"
                        : "bg-white/10 text-slate-400"
                  }`}
                >
                  {index + 1}
                </span>
                <p className="text-sm font-semibold text-white">{step.label}</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">{step.description}</p>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 rounded-2xl border border-white/8 bg-slate-950/40 p-4">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          <span className="text-slate-300">현재 분석 진행률</span>
          <span className="font-medium text-white">{Math.min(percentage, 92)}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/10">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-fuchsia-300 to-cyan-300 transition-all duration-700"
            style={{ width: `${Math.min(percentage, 92)}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-slate-400">원문 전체를 복제하지 않고 요약 가능한 본문과 신호만 추출합니다.</p>
      </div>
    </section>
  );
}
