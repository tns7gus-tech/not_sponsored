const SUPPORT_COLUMNS = [
  {
    title: "지원하는 소스",
    description: "공개적으로 접근 가능한 검색 결과와 공개 URL 중심으로 동작합니다.",
    className: "border-emerald-200 bg-emerald-50/90",
    titleClassName: "text-emerald-900",
    bulletClassName: "bg-emerald-700/75",
    items: ["네이버 블로그", "네이버 뉴스", "YouTube 공개 영상", "웹 문서", "사용자가 입력한 공개 URL"],
  },
  {
    title: "제한적으로 보는 영역",
    description: "플랫폼 정책과 공개 범위에 따라 일부 정보만 보일 수 있습니다.",
    className: "border-amber-200 bg-amber-50/90",
    titleClassName: "text-amber-900",
    bulletClassName: "bg-amber-700/75",
    items: ["일부 SNS 공개 링크", "반응 데이터가 약한 문서", "본문 일부만 노출되는 미리보기 페이지"],
  },
  {
    title: "분석하지 않는 영역",
    description: "보안과 법적 경계를 위해 처음부터 제외합니다.",
    className: "border-rose-200 bg-rose-50/90",
    titleClassName: "text-rose-900",
    bulletClassName: "bg-rose-700/75",
    items: ["로그인 필요 페이지", "비공개 커뮤니티", "이메일 주소", "비표준 포트 주소", "민감정보가 포함된 비공개 문서"],
  },
] as const;

const SUPPORT_ROWS = [
  {
    target: "네이버 블로그",
    status: "지원",
    tone: "supported",
    description: "공개 검색 결과와 본문 일부를 기준으로 리서치 카드에 반영합니다.",
  },
  {
    target: "네이버 카페",
    status: "지원",
    tone: "supported",
    description: "검색 결과에 공개적으로 노출되는 글만 수집 대상으로 봅니다.",
  },
  {
    target: "네이버 뉴스",
    status: "지원",
    tone: "supported",
    description: "후기성 문맥과 제품 맥락을 함께 볼 수 있는 공개 기사만 다룹니다.",
  },
  {
    target: "YouTube 공개 영상",
    status: "지원",
    tone: "supported",
    description: "영상 제목, 설명, 채널 문맥을 기반으로 실사용 신호를 정리합니다.",
  },
  {
    target: "공개 웹 문서 / 공개 URL",
    status: "지원",
    tone: "supported",
    description: "브라우저에서 열리는 공개 HTML 페이지를 직접 분석할 수 있습니다.",
  },
  {
    target: "일부 SNS 공개 링크",
    status: "제한적",
    tone: "limited",
    description: "플랫폼 정책과 공개 범위에 따라 일부 정보만 읽히거나 본문이 짧을 수 있습니다.",
  },
  {
    target: "로그인 필요 페이지",
    status: "미지원",
    tone: "blocked",
    description: "계정 인증이 필요한 페이지는 처음부터 차단합니다.",
  },
  {
    target: "비공개 커뮤니티 / 내부망",
    status: "미지원",
    tone: "blocked",
    description: "사설망, 로컬 주소, 비공개 커뮤니티는 보안 경계 때문에 제외합니다.",
  },
  {
    target: "비표준 포트 / 파일 다운로드 주소",
    status: "미지원",
    tone: "blocked",
    description: "80/443 외 주소, PDF나 앱 딥링크처럼 웹 문서가 아닌 대상은 분석하지 않습니다.",
  },
] as const;

const STATUS_STYLES = {
  supported: "border-emerald-300/16 bg-emerald-300/12 text-emerald-100",
  limited: "border-amber-300/16 bg-amber-300/12 text-amber-100",
  blocked: "border-rose-300/16 bg-rose-300/12 text-rose-100",
} as const;

export default function SupportScopeSection() {
  return (
    <section aria-labelledby="support-scope-title" className="mx-auto mt-14 w-full max-w-6xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-[#6b7684]">지원 범위</p>
          <h2 id="support-scope-title" className="mt-2 text-2xl font-semibold text-[#191f28]">
            어디까지 보고 어디서 멈추는지 먼저 밝힙니다
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-[#4e5968]">
          공개 URL만 다루는 이유와 제외 기준을 먼저 보여줘야 과장된 기대를 줄이고 서비스 경계를 분명하게 설명할 수 있습니다.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {SUPPORT_COLUMNS.map((column) => (
          <article key={column.title} className={`rounded-[24px] border p-5 ${column.className}`}>
            <h3 className={`text-lg font-semibold ${column.titleClassName}`}>{column.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#334155]">{column.description}</p>
            <ul className="mt-4 space-y-2.5">
              {column.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm leading-6 text-[#191f28]">
                  <span className={`mt-2 h-1.5 w-1.5 rounded-full ${column.bulletClassName}`} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(9,17,29,0.76)] shadow-[0_16px_48px_rgba(4,10,20,0.22)] backdrop-blur-xl">
        <div className="hidden grid-cols-[1.2fr_0.7fr_1.8fr] gap-4 border-b border-white/8 px-5 py-4 text-xs font-semibold tracking-[0.18em] text-slate-200 md:grid">
          <span>대상</span>
          <span>현재 상태</span>
          <span>설명</span>
        </div>

        <ul className="divide-y divide-white/8">
          {SUPPORT_ROWS.map((row) => (
            <li key={row.target} className="px-5 py-4">
              <div className="grid gap-3 md:grid-cols-[1.2fr_0.7fr_1.8fr] md:items-center md:gap-4">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-200 md:hidden">대상</p>
                  <p className="text-sm font-semibold text-white">{row.target}</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-200 md:hidden">현재 상태</p>
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[row.tone]}`}>
                    {row.status}
                  </span>
                </div>

                <div>
                  <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-200 md:hidden">설명</p>
                  <p className="text-sm leading-6 text-slate-100">{row.description}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-xs leading-6 text-[#5b6675]">
        공개 HTML 페이지가 아니거나 접근 권한이 필요한 주소는 분석을 시도하지 않습니다. 먼저 경계를 밝히는 이유는 과장된 기대를 줄이고
        서비스 책임 범위를 분명하게 하기 위해서입니다.
      </p>
    </section>
  );
}
