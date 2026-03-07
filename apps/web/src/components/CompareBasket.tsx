import { type SourceResult } from "@/lib/api";

export interface CompareBasketProps {
    compareList: SourceResult[];
    setCompareList: (list: SourceResult[]) => void;
    setIsCompareModalOpen: (isOpen: boolean) => void;
}

export default function CompareBasket({
    compareList,
    setCompareList,
    setIsCompareModalOpen
}: CompareBasketProps) {
    if (compareList.length === 0) return null;

    return (
        <div
            role="region"
            aria-label="제품 비교 바구니"
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-md border border-indigo-500/50 rounded-2xl p-4 shadow-2xl flex items-center gap-6 z-40 max-w-lg w-[calc(100%-2rem)] transition-all animate-in slide-in-from-bottom-5"
        >
            <div className="flex-1">
                <h4 className="text-white font-medium text-sm">제품 비교함 <span className="text-indigo-400 font-bold">({compareList.length}/3)</span></h4>
                <p className="text-gray-400 text-xs mt-0.5 truncate">{compareList.map(c => c.title).join(", ")}</p>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setCompareList([])}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    aria-label="비교함 비우기"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
                <button
                    onClick={() => setIsCompareModalOpen(true)}
                    disabled={compareList.length < 2}
                    className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    aria-label={compareList.length < 2 ? "비교하려면 최소 2개를 담아주세요" : "비교 화면 열기"}
                >
                    대조하기
                </button>
            </div>
        </div>
    );
}
