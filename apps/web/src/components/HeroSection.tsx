export default function HeroSection() {
  return (
    <header className="mx-auto mb-10 w-full max-w-5xl text-center sm:mb-14">
      <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold tracking-[0.22em] text-cyan-200">
        신뢰 기반 구매 리서치
      </div>

      <div className="mt-5 flex items-center justify-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-sky-500 shadow-[0_12px_32px_rgba(34,211,238,0.28)]"
          aria-hidden="true"
        >
          <svg className="h-7 w-7 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.2}
              d="M9 12l2 2 4-4m6 2A9 9 0 113 12a9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-left">
          <span className="block text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Not Sponsored</span>
          <span className="block text-lg font-semibold text-white sm:text-xl">광고보다 근거를 먼저 보는 구매 리서치</span>
        </p>
      </div>

      <h1 className="mx-auto mt-6 max-w-4xl text-balance text-4xl font-semibold leading-tight text-white sm:text-5xl">
        검색 결과와 공개 URL을 한 번에 읽어,
        <span className="block bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-300 bg-clip-text text-transparent">
          믿을 만한 근거부터 보여줍니다
        </span>
      </h1>

      <p className="mx-auto mt-5 max-w-3xl text-pretty text-base leading-7 text-slate-300 sm:text-lg">
        광고성 신호, 실사용 표현, 반복되는 장단점을 카드 형태로 정리해 구매 전 리서치 시간을 줄입니다. 단정 대신 근거를 우선
        보여주는 방식으로 설계했습니다.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2.5">
        {["샘플 결과 미리보기", "광고 신호 감지", "공개 URL 직접 분석", "저장과 비교 흐름"].map((item) => (
          <span
            key={item}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200"
          >
            {item}
          </span>
        ))}
      </div>
    </header>
  );
}
