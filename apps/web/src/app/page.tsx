"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SearchInput from "@/components/SearchInput";
import { createSearch } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { job_id } = await createSearch(query);
      router.push(`/search/${job_id}`);
    } catch (err) {
      setError("검색 요청에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.");
      setIsLoading(false);
    }
  };

  return (
    <main id="main-content" className="flex flex-col items-center justify-center min-h-screen px-4">
      {/* 로고 + 타이틀 */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Not Sponsored
          </h1>
        </div>
        <p className="text-gray-400 text-lg max-w-lg mx-auto leading-relaxed">
          광고/협찬 가능성이 낮고 근거가 투명한 후기를<br />
          우선 탐색하는 <span className="text-white font-medium">AI 구매 리서치 에이전트</span>
        </p>
      </div>

      {/* 검색 입력 */}
      <SearchInput onSearch={handleSearch} isLoading={isLoading} />

      {/* 에러 메시지 */}
      {error && (
        <div className="mt-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm max-w-lg text-center">
          {error}
        </div>
      )}

      {/* 하단 설명 */}
      <div className="mt-16 max-w-2xl mx-auto">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div className="p-4">
            <div className="text-2xl mb-2">🔍</div>
            <p className="text-gray-400 text-xs">제품명만 입력하면<br />다중 소스 자동 검색</p>
          </div>
          <div className="p-4">
            <div className="text-2xl mb-2">🛡️</div>
            <p className="text-gray-400 text-xs">광고/협찬 신호를<br />자동으로 감지</p>
          </div>
          <div className="p-4">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-gray-400 text-xs">근거와 함께<br />신뢰도를 표시</p>
          </div>
        </div>
      </div>

      {/* 면책 문구 */}
      <p className="mt-12 text-gray-600 text-[10px] max-w-md text-center">
        이 서비스는 AI 기반 자동 추정 결과를 제공하며, 사실의 확정이 아닙니다.
        구매 결정 전 원문을 직접 확인하시기 바랍니다.
      </p>
    </main>
  );
}
