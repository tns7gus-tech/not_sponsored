"use client";

import { useEffect, useState, type FormEvent } from "react";

interface Props {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  initialValue?: string;
}

export default function SearchInput({ onSearch, isLoading, initialValue = "" }: Props) {
  const [query, setQuery] = useState(initialValue);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      onSearch(trimmed);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="w-full" aria-labelledby="search-query-label">
        <label id="search-query-label" htmlFor="search-query" className="sr-only">
          검색어 입력
        </label>

        <div className="group flex min-h-[78px] items-center rounded-full border border-[#e5e8eb] bg-white px-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition duration-200 focus-within:border-[#3182f6] focus-within:shadow-[0_18px_42px_rgba(49,130,246,0.14)] sm:px-6">
          <div className="mr-4 text-[#8b95a1]" aria-hidden="true">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35m1.85-4.65a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <input
            id="search-query"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="예: 아이폰 17 배터리 후기, 로봇청소기 물걸레 단점"
            enterKeyHint="search"
            autoComplete="off"
            disabled={isLoading}
            className="min-w-0 flex-1 bg-transparent text-base text-[#191f28] outline-none placeholder:text-[#8b95a1] sm:text-lg"
          />

          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            aria-label={isLoading ? "검색을 진행 중입니다" : "검색 시작"}
            className="ml-4 inline-flex h-12 items-center justify-center rounded-full bg-[#3182f6] px-5 text-sm font-semibold text-white transition hover:bg-[#2272eb] disabled:cursor-not-allowed disabled:bg-[#d1d6db] sm:px-6"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                검색 중
              </span>
            ) : (
              "검색"
            )}
          </button>
        </div>
      </form>

      <p className="mt-3 px-1 text-sm leading-6 text-[#6b7684]">
        브랜드명, 모델명, 궁금한 기준을 함께 넣으면 결과가 더 안정적입니다.
      </p>
    </div>
  );
}
