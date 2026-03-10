"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import SearchInput from "@/components/SearchInput";
import { createSearch } from "@/lib/api";

const HISTORY_KEY = "not_sponsored_history";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { job_id } = await createSearch(query);

      const stored = localStorage.getItem(HISTORY_KEY);
      let history: { query: string; jobId: string; timestamp: number }[] = [];

      if (stored) {
        try {
          history = JSON.parse(stored);
        } catch {
          history = [];
        }
      }

      history = history.filter((item) => item.query !== query);
      history.unshift({ query, jobId: job_id, timestamp: Date.now() });

      if (history.length > 10) {
        history = history.slice(0, 10);
      }

      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      router.push(`/search/${job_id}`);
    } catch {
      setError("검색을 시작하지 못했습니다. 잠시 후 다시 시도해주세요.");
      setIsLoading(false);
    }
  };

  return (
    <main id="main-content" className="min-h-screen px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-4xl flex-col items-center justify-center">
        <div className="mb-10 flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#3182f6] text-2xl font-semibold text-white shadow-[0_18px_38px_rgba(49,130,246,0.28)]">
            N
          </div>
          <h1 className="text-center text-[2.625rem] font-semibold tracking-[-0.04em] text-[#191f28] sm:text-[3.25rem]">
            Not Sponsored
          </h1>
        </div>

        <div className="w-full max-w-3xl">
          <SearchInput onSearch={handleSearch} isLoading={isLoading} />

          {error && (
            <div
              role="alert"
              className="mx-auto mt-5 max-w-2xl rounded-[20px] border border-[#f1b7b4] bg-[#fff5f5] px-4 py-3 text-center text-sm text-[#b42318]"
            >
              {error}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
