import { type SourceResult } from "@/lib/api";
import ResultSignalGroups from "./ResultSignalGroups";

interface SampleCard {
  kind: string;
  query: string;
  summary: string;
  badge: string;
  badgeClassName: string;
  result: SourceResult;
  sources: string[];
  ctas: string[];
  note: string;
}

const SAMPLE_CARDS: SampleCard[] = [
  {
    kind: "검색 리포트 예시",
    query: "아이폰 17 후기",
    summary: "배터리 평가는 엇갈리지만 발열 언급이 반복되고, 광고성 링크 삽입은 상대적으로 적게 보입니다.",
    badge: "광고 신호 낮음",
    badgeClassName: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
    sources: ["네이버 블로그 12건", "YouTube 리뷰 5건", "웹문서 3건"],
    ctas: ["저장하기", "비교에 추가", "원문 보기"],
    note: "실제 검색 결과에서는 원문 이동, 저장, 비교 기능이 함께 제공됩니다.",
    result: {
      id: "sample-search",
      platform: "naver_blog",
      url: "https://example.com/sample-search",
      title: "아이폰 17 후기 샘플 카드",
      author_name: "샘플 작성자",
      published_at: "2026-03-08",
      snippet: "발열과 배터리 체감이 함께 언급되며, 사용 기간을 밝힌 후기 비중이 상대적으로 높았습니다.",
      explanations: [
        "+ 실사용 기간과 사용 맥락을 구체적으로 언급한 후기가 반복됩니다",
        "+ 장점뿐 아니라 발열·무게 같은 단점 표현도 함께 등장합니다",
        "- 구매 링크와 할인 코드가 반복 삽입된 게시물은 일부 존재합니다",
        "댓글·조회수처럼 반응 지표가 없는 원문은 해석이 제한됩니다",
      ],
    },
  },
  {
    kind: "공개 URL 분석 예시",
    query: "단일 페이지 URL 분석",
    summary: "공개된 한 페이지를 읽어 표현 방식과 링크 구조를 확인하고, 광고성 문구와 근거 밀도를 함께 보여줍니다.",
    badge: "단일 페이지 점검",
    badgeClassName: "border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-100",
    sources: ["입력한 공개 URL 1건", "페이지 본문 요약", "링크/표현 신호"],
    ctas: ["URL 다시 분석", "결과 공유", "정정 요청"],
    note: "단일 URL 분석은 검색 결과 전체 합의도가 아니라, 해당 페이지 자체의 표현과 구조만 검토합니다.",
    result: {
      id: "sample-url",
      platform: "web_analysis",
      url: "https://example.com/sample-url",
      title: "공개 URL 분석 샘플 카드",
      published_at: "2026-03-07",
      snippet: "협찬 고지 여부, 링크 배치, 사용 경험 서술의 구체성을 함께 읽어 단일 문서의 신뢰 맥락을 요약합니다.",
      explanations: [
        "+ 사용 기간과 비교 대상이 함께 적혀 있어 맥락을 읽기 쉽습니다",
        "- 링크와 CTA 문구가 문단 사이에 반복 삽입됩니다",
        "작성자 소개와 반응 지표가 없어 추가 확인이 필요합니다",
      ],
    },
  },
];

export default function HomeSampleSection() {
  return (
    <section aria-labelledby="sample-preview-title" className="w-full">
      <div className="rounded-[30px] border border-white/10 bg-[rgba(9,17,29,0.8)] p-5 shadow-[0_24px_72px_rgba(4,10,20,0.28)] backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-slate-400">결과 미리보기</p>
            <h2 id="sample-preview-title" className="mt-2 text-2xl font-semibold text-white">
              검색 뒤에 어떤 카드가 나오는지 먼저 보여줍니다
            </h2>
          </div>
          <span className="self-start rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100">
            첫 화면에서 결과 형태를 바로 이해
          </span>
        </div>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
          원칙 설명만으로는 부족합니다. 아래 데모 카드처럼 요약, 근거 신호, 대표 출처가 함께 보이면 이 서비스가 무엇을 주는지
          5초 안에 파악할 수 있습니다.
        </p>

        <div className="mt-6 grid gap-4">
          {SAMPLE_CARDS.map((sample) => (
            <article
              key={sample.kind}
              className="rounded-[26px] border border-white/8 bg-slate-950/45 p-5 shadow-[0_14px_40px_rgba(4,10,20,0.18)]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-slate-400">{sample.kind}</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{sample.query}</h3>
                </div>
                <span className={`self-start rounded-full border px-3 py-1 text-xs font-medium ${sample.badgeClassName}`}>
                  {sample.badge}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-200">{sample.summary}</p>

              <div className="mt-4 rounded-2xl border border-white/8 bg-white/5 p-4">
                <p className="text-xs font-semibold tracking-[0.18em] text-slate-400">대표 출처</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sample.sources.map((source) => (
                    <span
                      key={source}
                      className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1.5 text-xs text-slate-200"
                    >
                      {source}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <ResultSignalGroups result={sample.result} compact />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {sample.ctas.map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200"
                  >
                    {label}
                  </span>
                ))}
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-400">{sample.note}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
