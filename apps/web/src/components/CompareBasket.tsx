import { type SourceResult } from "@/lib/api";

export interface CompareBasketProps {
  compareList: SourceResult[];
  setCompareList: (list: SourceResult[]) => void;
  setIsCompareModalOpen: (isOpen: boolean) => void;
}

export default function CompareBasket({
  compareList,
  setCompareList,
  setIsCompareModalOpen,
}: CompareBasketProps) {
  if (compareList.length === 0) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="제품 비교 바구니"
      className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-40 flex w-[min(92vw,720px)] -translate-x-1/2 flex-col gap-3 rounded-[24px] border border-indigo-300/20 bg-[rgba(9,17,29,0.92)] p-4 shadow-[0_24px_72px_rgba(4,10,20,0.36)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-200/80">Compare Basket</p>
        <h4 className="mt-1 text-sm font-semibold text-white">비교 후보 {compareList.length}/3</h4>
        <p className="mt-1 truncate text-xs text-slate-300">
          {compareList.map((item) => item.title).join(" · ")}
        </p>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setCompareList([])}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          aria-label="비교함 비우기"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setIsCompareModalOpen(true)}
          disabled={compareList.length < 2}
          className="rounded-xl bg-indigo-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-indigo-200 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={compareList.length < 2 ? "비교하려면 최소 2개를 담아주세요" : "비교 보기 열기"}
        >
          비교 보기
        </button>
      </div>
    </div>
  );
}
