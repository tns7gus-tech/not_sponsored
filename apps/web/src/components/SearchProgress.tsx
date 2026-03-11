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
  { label: "검색어 확장", description: "입력한 검색어를 후기, 비교, 단점 같은 하위 질의로 확장합니다." },
  { label: "네이버 수집", description: "블로그, 카페, 뉴스, 쇼핑 결과를 모읍니다." },
  { label: "유튜브 수집", description: "영상 제목과 설명, 채널 정보를 함께 확인합니다." },
  { label: "광고성 신호 분석", description: "제휴 링크, 제공 표현, 반복 CTA를 점검합니다." },
  { label: "판단 요소 정리", description: "반복되는 장점과 단점을 묶어 요약합니다." },
  { label: "리포트 생성", description: "근거 신호와 주의 신호를 카드로 정리합니다." },
] as const;

export default function SearchProgress({ query, expandedQueries, progress }: Props) {
  const percentage = progress
    ? Math.round((progress.connectors_done / Math.max(progress.connectors_total, 1)) * 100)
    : 12;
  const currentStepIndex = getCurrentStepIndex(progress);
  const currentStep = WORKFLOW_STEPS[currentStepIndex];
  const totalSources = progress?.connectors_total ?? SOURCES.length;

  return (
    <section aria-live="polite" aria-busy="true" className="mx-auto mt-10 w-full max-w-4xl">
      <div className="rounded-[32px] border border-[#e5e8eb] bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.06)] sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#6b7684]">검색 진행 중</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#191f28]">
              {query} 관련 결과를 정리하고 있어요
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#6b7684]">
              여러 소스에서 문장을 모으고 광고성 신호와 실사용 표현을 함께 보는 리포트로 묶는 과정입니다.
            </p>
          </div>

          <span className="self-start rounded-full bg-[#eef4ff] px-4 py-2 text-sm font-semibold text-[#3182f6]">
            {currentStep.label}
          </span>
        </div>

        <ol className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {WORKFLOW_STEPS.map((step, index) => {
            const state = index < currentStepIndex ? "done" : index === currentStepIndex ? "current" : "upcoming";
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

        {expandedQueries && expandedQueries.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-[#4e5968]">확장된 검색 질의</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {expandedQueries.slice(0, 10).map((item, index) => (
                <span
                  key={item}
                  className="rounded-full bg-[#f2f4f6] px-3 py-1.5 text-xs text-[#4e5968]"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {item}
                </span>
              ))}
              {expandedQueries.length > 10 && (
                <span className="rounded-full bg-[#f2f4f6] px-3 py-1.5 text-xs text-[#8b95a1]">
                  +{expandedQueries.length - 10}개
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 rounded-[24px] bg-[#fafbfc] p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-[#4e5968]">진행 중인 소스</h3>
            <span className="text-sm text-[#8b95a1]">
              {progress?.connectors_done ?? 0}/{totalSources} 완료
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {SOURCES.map((source, index) => {
              const done = progress ? index < progress.connectors_done : false;
              const active = progress
                ? index === progress.connectors_done && progress.connectors_done < totalSources
                : index === 0;

              return (
                <div
                  key={source}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
                    done
                      ? "bg-[#eef4ff] text-[#3182f6]"
                      : active
                        ? "bg-[#f2f7ff] text-[#2272eb]"
                        : "bg-white text-[#8b95a1]"
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
                    <span className="h-2 w-2 rounded-full bg-[#d1d6db]" aria-hidden="true" />
                  )}
                  {source}
                </div>
              );
            })}
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="text-[#6b7684]">진행률</span>
              <span className="font-semibold text-[#191f28]">{percentage}%</span>
            </div>
            <div className="h-2 rounded-full bg-[#e5e8eb]">
              <div className="h-2 rounded-full bg-[#3182f6] transition-all duration-700" style={{ width: `${percentage}%` }} />
            </div>
            {progress && progress.results_collected > 0 && (
              <p className="mt-3 text-sm text-[#6b7684]">
                임시 결과 <span className="font-semibold text-[#191f28]">{progress.results_collected}개</span>를 모으고 있습니다.
              </p>
            )}
          </div>
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
