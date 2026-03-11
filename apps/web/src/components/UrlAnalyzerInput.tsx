"use client";

import { useEffect, useState, type FormEvent } from "react";

interface Props {
  onAnalyze: (url: string) => void;
  isLoading?: boolean;
  initialValue?: string;
}

export default function UrlAnalyzerInput({ onAnalyze, isLoading, initialValue = "" }: Props) {
  const [url, setUrl] = useState(initialValue);

  useEffect(() => {
    setUrl(initialValue);
  }, [initialValue]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = url.trim();
    if (trimmed) {
      onAnalyze(trimmed);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative" aria-labelledby="url-form-title">
        <div className="mb-3 flex flex-col gap-1">
          <label id="url-form-title" htmlFor="analyze-url" className="text-sm font-medium text-slate-200">
            공개 URL 분석
          </label>
          <p id="url-help" className="text-sm text-slate-400">
            로그인 필요 페이지, 이메일 주소, 비표준 포트는 차단합니다.
          </p>
        </div>

        <div className="group relative">
          <div className="absolute -inset-0.5 rounded-[26px] bg-gradient-to-r from-fuchsia-400/45 via-cyan-400/40 to-sky-400/35 blur opacity-40 transition duration-500 group-hover:opacity-70" />
          <div className="relative rounded-[26px] border border-white/12 bg-slate-950/90 p-2 backdrop-blur-xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                <div className="text-slate-400" aria-hidden="true">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </div>
                <input
                  id="analyze-url"
                  type="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="분석할 공개 페이지 URL을 붙여 넣어 주세요"
                  aria-describedby="url-help"
                  enterKeyHint="go"
                  className="min-h-[56px] w-full bg-transparent text-base text-white outline-none placeholder:text-slate-500 sm:text-lg"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={!url.trim() || isLoading}
                aria-label={isLoading ? "URL 분석 진행 중" : "URL 분석 시작"}
                className="min-h-[48px] rounded-[18px] bg-gradient-to-r from-fuchsia-300 to-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:from-fuchsia-200 hover:to-cyan-200 disabled:cursor-not-allowed disabled:opacity-35 sm:px-6"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    분석 중
                  </span>
                ) : (
                  "URL 분석"
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="mt-4 rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-slate-300">
        본문 전체를 복제하지 않고 요약 가능한 본문과 신호만 사용합니다.
      </div>
    </div>
  );
}
