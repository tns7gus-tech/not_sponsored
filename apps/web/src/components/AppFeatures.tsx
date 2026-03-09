const FEATURE_CARDS = [
  {
    title: "다중 소스 검색",
    description: "제품명 하나로 네이버, 유튜브, 웹 페이지 단서를 묶어서 확인합니다.",
    accent: "from-emerald-400/20 to-cyan-400/10",
  },
  {
    title: "근거 기반 설명",
    description: "점수만 주지 않고 어떤 표현이 신뢰도에 영향을 줬는지 함께 보여줍니다.",
    accent: "from-cyan-400/20 to-sky-400/10",
  },
  {
    title: "안전한 분석 경계",
    description: "공개 URL만 허용하고, 내부망·비표준 포트·민감정보는 기본 차단합니다.",
    accent: "from-sky-400/20 to-indigo-400/10",
  },
];

export default function AppFeatures() {
  return (
    <section aria-labelledby="features-title" className="mx-auto mt-14 w-full max-w-6xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.24em] text-slate-400">서비스 원칙</p>
          <h2 id="features-title" className="mt-2 text-2xl font-semibold text-white">
            이 서비스가 지키는 핵심 방향
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-300">
          후기의 진위를 단정하지 않고, 공개 근거를 먼저 정리해 보여줍니다. 최종 판단은 사용자가 직접 원문과 맥락을 확인한 뒤
          내릴 수 있어야 합니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {FEATURE_CARDS.map((card) => (
          <article
            key={card.title}
            className="rounded-[24px] border border-white/10 bg-[rgba(9,18,30,0.72)] p-5 shadow-[0_16px_48px_rgba(4,10,20,0.24)] backdrop-blur-xl"
          >
            <div className={`mb-4 h-10 rounded-2xl bg-gradient-to-r ${card.accent}`} aria-hidden="true" />
            <h3 className="text-lg font-semibold text-white">{card.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">{card.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
