const FEATURE_CARDS = [
  {
    title: "여러 소스를 한 번에",
    description: "상품명 하나로 네이버와 유튜브의 공개 결과를 묶어서 살펴볼 수 있습니다.",
    accent: "from-emerald-400/20 to-cyan-400/10",
  },
  {
    title: "점수보다 근거를 먼저",
    description: "숫자만 보여주지 않고 어떤 문장과 구조가 판단에 영향을 주는지 함께 설명합니다.",
    accent: "from-cyan-400/20 to-sky-400/10",
  },
  {
    title: "보안 경계를 분명하게",
    description: "공개 URL만 다루고 로그인 필요 페이지나 비공개 주소는 처음부터 차단합니다.",
    accent: "from-sky-400/20 to-indigo-400/10",
  },
];

export default function AppFeatures() {
  return (
    <section aria-labelledby="features-title" className="mx-auto mt-14 w-full max-w-6xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.24em] text-slate-200">서비스 원칙</p>
          <h2 id="features-title" className="mt-2 text-2xl font-semibold text-white">
            이 프로젝트가 지키는 기준
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-100">
          광고 여부를 단정하는 도구가 아니라 공개 근거를 더 빨리 확인하도록 돕는 구매 리서치 보조 도구에 가깝습니다.
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
            <p className="mt-2 text-sm leading-6 text-slate-100">{card.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
