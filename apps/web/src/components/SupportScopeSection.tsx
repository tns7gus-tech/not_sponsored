const SUPPORT_COLUMNS = [
  {
    title: "지원 소스",
    description: "공개적으로 접근 가능한 검색 결과와 URL입니다.",
    className: "border-emerald-300/12 bg-emerald-300/6",
    titleClassName: "text-emerald-100",
    items: ["네이버 블로그", "네이버 뉴스", "YouTube 공개 영상", "웹문서", "사용자가 입력한 공개 URL"],
  },
  {
    title: "제한적으로 검토",
    description: "플랫폼 정책과 공개 범위에 따라 일부만 읽을 수 있습니다.",
    className: "border-amber-300/12 bg-amber-300/6",
    titleClassName: "text-amber-100",
    items: ["기타 SNS 공개 링크", "반응 지표가 없는 웹문서", "짧은 본문만 제공되는 미리보기 페이지"],
  },
  {
    title: "분석하지 않음",
    description: "보안과 법적 경계 때문에 처음부터 제외합니다.",
    className: "border-rose-300/12 bg-rose-300/6",
    titleClassName: "text-rose-100",
    items: ["로그인 필요 페이지", "비공개 커뮤니티", "내부망 주소", "비표준 포트 주소", "민감정보가 포함된 비공개 문서"],
  },
] as const;

export default function SupportScopeSection() {
  return (
    <section aria-labelledby="support-scope-title" className="mx-auto mt-14 w-full max-w-6xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-slate-400">지원 범위</p>
          <h2 id="support-scope-title" className="mt-2 text-2xl font-semibold text-white">
            어디까지 읽고, 어디서 멈추는지 먼저 밝힙니다
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-slate-300">
          공개 URL만 다루는 이유를 처음부터 분명히 보여줘야 과장된 기대를 줄이고, 서비스의 안전 경계도 이해시키기 쉽습니다.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {SUPPORT_COLUMNS.map((column) => (
          <article key={column.title} className={`rounded-[24px] border p-5 ${column.className}`}>
            <h3 className={`text-lg font-semibold ${column.titleClassName}`}>{column.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">{column.description}</p>
            <ul className="mt-4 space-y-2.5">
              {column.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm leading-6 text-slate-200">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-white/60" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
