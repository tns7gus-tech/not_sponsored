"use client";

import { useRouter } from "next/navigation";

interface Props {
  fallbackHref?: string;
  label?: string;
  className?: string;
}

const DEFAULT_CLASS_NAME =
  "inline-flex items-center gap-2 rounded-full border border-[#d7dde5] bg-white px-4 py-2 text-sm font-semibold text-[#243240] shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition hover:bg-[#f8fafb] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3182f61f]";

export default function BackButton({ fallbackHref = "/", label = "뒤로가기", className }: Props) {
  const router = useRouter();

  const handleClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  };

  return (
    <button type="button" onClick={handleClick} className={className || DEFAULT_CLASS_NAME}>
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      {label}
    </button>
  );
}
