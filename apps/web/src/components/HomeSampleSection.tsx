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
  note: string;
}

const SAMPLE_CARDS: SampleCard[] = [
  {
    kind: "검색 리포트 예시",
    query: "아이폰 17 실사용 후기",
    summary: "배터리 평가는 좋지만 발열 언급도 함께 나오고, 광고성 링크가 거의 없는 글이 위쪽에 오도록 정리하는 형태입니다.",
    badge: "검색 결과 기반",
    badgeClassName: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
    sources: ["네이버 블로그 12건", "YouTube 5건", "뉴스 3건"],
    note: "실제 화면에서는 원문 이동, 비교 추가, 피드백 제출까지 이어집니다.",
    result: {
      id: "sample-search",
      platform: "naver_blog",
      url: "https://example.com/sample-search",
      title: "아이폰 17 실사용 카드 예시",
      author_name: "샘플 작성자",
      published_at: "2026-03-08",
      snippet: "사용 기간과 함께 장점과 단점을 같이 적은 글이 상단에 오고, 광고성 문구가 강한 글은 낮은 등급으로 내려갑니다.",
      explanations: [
        "+ 사용 기간과 직접 구매 문장이 함께 보입니다.",
        "+ 장점과 단점이 같이 정리되어 있습니다.",
        "- 구매 링크 반복 문구는 적습니다.",
      ],
    },
  },
  {
    kind: "공개 URL 분석 예시",
    query: "리뷰 페이지 링크 직접 분석",
    summary: "공개 페이지 하나를 넣고 문장 구조와 링크 배치를 확인해서 해당 페이지 자체의 광고성 신호를 빠르게 살펴보는 흐름입니다.",
    badge: "단일 페이지 분석",
    badgeClassName: "border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-100",
    sources: ["입력된 공개 URL 1건", "본문 요약", "링크/표현 신호"],
    note: "URL 분석은 전체 검색 결과 대신 특정 페이지 자체의 표현과 구조를 보는 용도입니다.",
    result: {
      id: "sample-url",
      platform: "web_analysis",
      url: "https://example.com/sample-url",
      title: "공개 URL 분석 카드 예시",
      published_at: "2026-03-07",
      snippet: "광고 문구 비중, CTA 반복, 실사용 묘사 여부를 기준으로 페이지를 요약합니다.",
      explanations: [
        "+ 본문 안에 구체적인 사용 상황이 보입니다.",
        "- 링크 유도 버튼이 여러 구간에 반복됩니다.",
        "정보가 부족한 항목은 별도로 표시합니다.",
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
            <p className="text-xs font-semibold tracking-[0.22em] text-slate-400">결과 미리 보기</p>
            <h2 id="sample-preview-title" className="mt-2 text-2xl font-semibold text-white">
              첫 화면에서 어떤 카드가 나오는지 바로 보여줍니다
            </h2>
          </div>
          <span className="self-start rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100">
            설명보다 예시가 더 빠릅니다
          </span>
        </div>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
          요약, 근거 신호, 수집 범위가 한 카드 안에서 같이 보이면 서비스가 무엇을 주는지 몇 초 안에 이해할 수 있습니다.
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
                <p className="text-xs font-semibold tracking-[0.18em] text-slate-400">보는 소스</p>
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

              <p className="mt-3 text-xs leading-5 text-slate-400">{sample.note}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
