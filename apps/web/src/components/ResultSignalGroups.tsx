import { type SourceResult } from "@/lib/api";
import { buildResultSignalGroups } from "@/lib/resultSignals";

interface Props {
  result: Pick<SourceResult, "explanations" | "author_name" | "published_at" | "snippet" | "engagement">;
  compact?: boolean;
  title?: string;
}

const GROUP_META = [
  {
    key: "positive",
    title: "긍정 신호",
    description: "실사용에 가까운 근거",
    containerClassName: "bg-[#f6fbf8]",
    titleClassName: "text-[#1b7f5a]",
    bulletClassName: "bg-[#1b7f5a]",
    emptyCopy: "아직 강한 긍정 신호는 많지 않습니다.",
  },
  {
    key: "caution",
    title: "주의 신호",
    description: "광고성 또는 과장 가능성",
    containerClassName: "bg-[#fff8f0]",
    titleClassName: "text-[#d66b00]",
    bulletClassName: "bg-[#d66b00]",
    emptyCopy: "뚜렷한 주의 신호는 적습니다.",
  },
  {
    key: "insufficient",
    title: "정보 부족",
    description: "추가 확인이 필요한 부분",
    containerClassName: "bg-[#f8fafb]",
    titleClassName: "text-[#4e5968]",
    bulletClassName: "bg-[#8b95a1]",
    emptyCopy: "현재 카드에서 부족한 정보는 많지 않습니다.",
  },
] as const;

export default function ResultSignalGroups({ result, compact = false, title = "이 결과에 영향을 준 신호" }: Props) {
  const groups = buildResultSignalGroups(result);
  const totalSignals = groups.positive.length + groups.caution.length + groups.insufficient.length;

  return (
    <section className="rounded-[24px] bg-[#fafbfc] p-4 sm:p-5">
      <div className="flex flex-col gap-2 border-b border-[#eef1f4] pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-[#8b95a1]">근거 신호</p>
          <h4 className="mt-1 text-sm font-semibold text-[#191f28] sm:text-base">{title}</h4>
        </div>
        <span className="text-xs text-[#8b95a1]">{totalSignals}개 신호</span>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-3">
        {GROUP_META.map((meta) => {
          const items = groups[meta.key];
          const visibleItems = items.slice(0, compact ? 2 : 4);

          return (
            <article key={meta.key} className={`rounded-[20px] p-4 ${meta.containerClassName}`}>
              <h5 className={`text-sm font-semibold ${meta.titleClassName}`}>{meta.title}</h5>
              <p className="mt-1 text-xs leading-5 text-[#8b95a1]">{meta.description}</p>
              <ul className="mt-3 space-y-2">
                {visibleItems.length > 0 ? (
                  visibleItems.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm leading-6 text-[#333d4b]">
                      <span className={`mt-2 h-1.5 w-1.5 rounded-full ${meta.bulletClassName}`} aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm leading-6 text-[#8b95a1]">{meta.emptyCopy}</li>
                )}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
