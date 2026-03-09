"use client";

interface Props {
  query: string;
  expandedQueries?: string[];
  progress?: {
    connectors_done: number;
    connectors_total: number;
    results_collected: number;
  };
}

const SOURCES = ["NAVER 블로그", "NAVER 카페", "NAVER 뉴스", "NAVER 쇼핑", "YouTube"];
const WORKFLOW_STEPS = [
  {
    label: "검색어 확장 중",
    description: "입력한 검색어를 세분화해 여러 질의로 나눕니다.",
  },
  {
    label: "네이버 결과 수집 중",
    description: "블로그, 카페, 뉴스, 쇼핑 단서를 묶어 수집합니다.",
  },
  {
    label: "유튜브 결과 수집 중",
    description: "영상 제목, 설명, 관련 문맥에서 후기를 찾습니다.",
  },
  {
    label: "광고성 신호 분석 중",
    description: "제휴 링크, 과도한 CTA, 홍보 문구를 확인합니다.",
  },
  {
    label: "반복 장단점 묶는 중",
    description: "여러 원문에서 자주 반복되는 장점과 단점을 합칩니다.",
  },
  {
    label: "리포트 정리 중",
    description: "신뢰 근거와 주의 신호를 카드 형태로 정리합니다.",
  },
] as const;

export default function SearchProgress({ query, expandedQueries, progress }: Props) {
  const percentage = progress
    ? Math.round((progress.connectors_done / Math.max(progress.connectors_total, 1)) * 100)
    : 12;
  const currentStepIndex = getCurrentStepIndex(progress);
  const currentStep = WORKFLOW_STEPS[currentStepIndex];
  const totalSources = progress?.connectors_total ?? SOURCES.length;

  return (
    <section aria-live="polite" aria-busy="true" className="mx-auto mt-12 w-full max-w-3xl">
      <div className="rounded-[28px] border border-white/10 bg-[rgba(9,17,29,0.76)] p-6 shadow-[0_24px_72px_rgba(4,10,20,0.32)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="relative flex h-4 w-4" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-400" />
              </div>
              <p className="text-lg font-medium text-white">
                <span className="text-emerald-300">{query}</span> 관련 후기를 정리하는 중입니다
              </p>
            </div>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              단순 로딩이 아니라 여러 소스에서 문장을 모으고, 광고성 신호와 실사용 표현을 함께 읽어 리포트로 묶는 과정입니다.
            </p>
          </div>

          <span className="self-start rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-100">
            현재 단계: {currentStep.label}
          </span>
        </div>

        <ol className="mt-6 grid gap-3 sm:grid-cols-2">
          {WORKFLOW_STEPS.map((step, index) => {
            const state = index < currentStepIndex ? "done" : index === currentStepIndex ? "current" : "upcoming";
            const cardClassName =
              state === "done"
                ? "border-emerald-300/16 bg-emerald-300/10"
                : state === "current"
                  ? "border-cyan-300/20 bg-cyan-300/10"
                  : "border-white/8 bg-white/5";

            return (
              <li key={step.label} className={`rounded-2xl border p-4 ${cardClassName}`}>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                      state === "done"
                        ? "bg-emerald-300/20 text-emerald-100"
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

        {expandedQueries && expandedQueries.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 text-sm font-medium text-slate-300">확장된 검색 질의</h2>
            <div className="flex flex-wrap gap-2">
              {expandedQueries.slice(0, 10).map((item, index) => (
                <span
                  key={item}
                  className="animate-fade-in rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {item}
                </span>
              ))}
              {expandedQueries.length > 10 && (
                <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-xs text-slate-400">
                  +{expandedQueries.length - 10}개 더
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-slate-300">진행 중인 소스</h2>
            <span className="text-sm text-slate-400">
              {progress?.connectors_done ?? 0}/{totalSources} 완료
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {SOURCES.map((source, index) => {
              const done = progress ? index < progress.connectors_done : false;
              const active = progress
                ? index === progress.connectors_done && progress.connectors_done < totalSources
                : index === 0;

              return (
                <div
                  key={source}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                    done
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                      : active
                        ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
                        : "border-white/8 bg-white/5 text-slate-400"
                  }`}
                >
                  {done ? (
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : active ? (
                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-slate-500" aria-hidden="true" />
                  )}
                  {source}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/8 bg-slate-950/40 p-4">
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-300">현재 분석 진행률</span>
            <span className="font-medium text-white">{percentage}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage}
            className="h-2 rounded-full bg-white/10"
          >
            <div
              className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-700"
              style={{ width: `${percentage}%` }}
            />
          </div>
          {progress && progress.results_collected > 0 && (
            <p className="mt-3 text-sm text-slate-400">
              후보 결과 <span className="font-medium text-cyan-300">{progress.results_collected}개</span>를 이미 확보했습니다.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function getCurrentStepIndex(progress?: Props["progress"]) {
  if (!progress) {
    return 0;
  }

  const connectorRatio = progress.connectors_done / Math.max(progress.connectors_total, 1);

  if (progress.connectors_done === 0) {
    return 0;
  }

  if (connectorRatio < 0.5) {
    return 1;
  }

  if (connectorRatio < 1) {
    return 2;
  }

  if (progress.results_collected < 5) {
    return 3;
  }

  if (progress.results_collected < 12) {
    return 4;
  }

  return 5;
}
