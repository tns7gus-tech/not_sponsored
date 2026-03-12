const SAVED_REPORTS = [
  {
    title: "아이폰 17 실사용 후기",
    date: "2026-03-06",
    summary: "발열 언급 증가, 배터리 평가는 긍정적",
  },
  {
    title: "아이폰 17 비교 후기",
    date: "2026-03-09",
    summary: "카메라 평가 증가, 광고 링크 비중은 낮음",
  },
];

const COMPARE_BENEFITS = [
  "같은 제품의 다른 시점 결과를 다시 이어 보고 변화한 판단 요소를 비교할 수 있습니다.",
  "플랫폼별로 무엇이 반복되고 무엇이 과장되는지 다시 확인할 수 있습니다.",
  "한 번 보고 끝나는 검색이 아니라 구매 전 반복 리서치를 이어갈 수 있습니다.",
];

export default function ComparePreviewSection() {
  return (
    <section aria-labelledby="compare-preview-title" className="mx-auto mt-14 w-full max-w-6xl">
      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-white/10 bg-[rgba(9,17,29,0.76)] p-5 shadow-[0_16px_48px_rgba(4,10,20,0.22)] backdrop-blur-xl sm:p-6">
          <p className="text-xs font-semibold tracking-[0.22em] text-slate-200">비교 흐름 예시</p>
          <div className="mt-4 space-y-3">
            {SAVED_REPORTS.map((item) => (
              <article key={`${item.title}-${item.date}`} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-base font-semibold text-white">{item.title}</h3>
                  <span className="text-xs text-slate-200">{item.date}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-200">{item.summary}</p>
              </article>
            ))}
          </div>

          <div className="mt-4 rounded-[24px] border border-cyan-300/12 bg-cyan-300/6 p-4">
            <h3 className="text-sm font-semibold text-cyan-100">비교하면 바로 보이는 변화</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
              <li>발열 언급: 이전보다 증가</li>
              <li>카메라 야간 촬영: 최근 후기에서 반복</li>
              <li>광고 링크 비중: 큰 변화 없음</li>
            </ul>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[rgba(9,17,29,0.76)] p-5 shadow-[0_16px_48px_rgba(4,10,20,0.22)] backdrop-blur-xl sm:p-6">
          <p className="text-xs font-semibold tracking-[0.22em] text-slate-200">반복 사용 가치</p>
          <h2 id="compare-preview-title" className="mt-2 text-2xl font-semibold text-white">
            보고 끝나는 검색보다 다시 보는 리서치가 더 중요합니다
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-100">
            구매 직전에는 한 번의 검색으로 끝나지 않습니다. 시간차 비교와 여러 번의 재확인이 실제 결정을 돕습니다.
          </p>

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
