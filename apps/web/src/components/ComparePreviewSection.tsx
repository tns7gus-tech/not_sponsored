const SAVED_REPORTS = [
  {
    title: "아이폰 17 후기",
    date: "2026-03-06",
    summary: "발열 언급 증가, 배터리 평가는 엇갈림",
  },
  {
    title: "아이폰 17 후기",
    date: "2026-03-09",
    summary: "카메라 저조도 언급 증가, 광고 링크 비중은 비슷함",
  },
];

const COMPARE_BENEFITS = [
  "같은 제품을 다른 시점에 다시 열어 변화한 장단점을 비교할 수 있습니다.",
  "플랫폼별로 무엇이 반복되고 무엇이 과장되는지 저장해두고 교차 확인할 수 있습니다.",
  "한 번 보고 끝나는 검색이 아니라, 구매 전 반복 리서치 흐름으로 이어집니다.",
];

export default function ComparePreviewSection() {
  return (
    <section aria-labelledby="compare-preview-title" className="mx-auto mt-14 w-full max-w-6xl">
      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-white/10 bg-[rgba(9,17,29,0.76)] p-5 shadow-[0_16px_48px_rgba(4,10,20,0.22)] backdrop-blur-xl sm:p-6">
          <p className="text-xs font-semibold tracking-[0.22em] text-slate-400">저장한 리포트 비교 예시</p>
          <div className="mt-4 space-y-3">
            {SAVED_REPORTS.map((item) => (
              <article key={`${item.title}-${item.date}`} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-base font-semibold text-white">{item.title}</h3>
                  <span className="text-xs text-slate-400">{item.date}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-200">{item.summary}</p>
              </article>
            ))}
          </div>

          <div className="mt-4 rounded-[24px] border border-cyan-300/12 bg-cyan-300/6 p-4">
            <h3 className="text-sm font-semibold text-cyan-100">비교하면 바로 보이는 변화</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
              <li>발열 언급: 이전보다 증가</li>
              <li>카메라 저조도 언급: 최근 리뷰에서 새로 반복됨</li>
              <li>광고 링크 비중: 큰 변화 없음</li>
            </ul>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[rgba(9,17,29,0.76)] p-5 shadow-[0_16px_48px_rgba(4,10,20,0.22)] backdrop-blur-xl sm:p-6">
          <p className="text-xs font-semibold tracking-[0.22em] text-slate-400">반복 사용 가치</p>
          <h2 id="compare-preview-title" className="mt-2 text-2xl font-semibold text-white">
            저장하고, 비교하고, 다시 열람할 수 있어야 계속 쓰게 됩니다
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            검색 결과를 한 번 보고 끝내지 않도록 저장과 비교 흐름을 홈에서도 보여줘야 합니다. 이 제품의 재방문 가치는
            검색 결과를 쌓아놓고 다시 비교하는 데 있습니다.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {["저장하기", "비교에 추가", "다시 열람"].map((label) => (
              <span
                key={label}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200"
              >
                {label}
              </span>
            ))}
          </div>

          <ul className="mt-6 space-y-3">
            {COMPARE_BENEFITS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-200">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
