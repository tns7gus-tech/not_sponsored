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

export default function SearchProgress({ query, expandedQueries, progress }: Props) {
  const percentage = progress
    ? Math.round((progress.connectors_done / Math.max(progress.connectors_total, 1)) * 100)
    : 15;

  return (
    <section aria-live="polite" aria-busy="true" className="mx-auto mt-12 w-full max-w-3xl">
      <div className="rounded-[28px] border border-white/10 bg-[rgba(9,17,29,0.76)] p-6 shadow-[0_24px_72px_rgba(4,10,20,0.32)] backdrop-blur-xl sm:p-8">
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
          검색어를 세분화해 여러 소스에 팬아웃 질의를 보내고, 수집된 문장에서 광고성·실사용 신호를 함께 읽고 있습니다.
        </p>

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
              {progress?.connectors_done ?? 0}/{progress?.connectors_total ?? SOURCES.length} 완료
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {SOURCES.map((source, index) => {
              const done = progress ? index < progress.connectors_done : false;
              return (
                <div
                  key={source}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                    done
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
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
                  ) : (
                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
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
