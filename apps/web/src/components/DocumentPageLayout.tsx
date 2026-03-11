import Link from "next/link";
import type { ReactNode } from "react";

interface Props {
  eyebrow: string;
  title: string;
  description: string;
  updatedAt: string;
  children: ReactNode;
}

export default function DocumentPageLayout({ eyebrow, title, description, updatedAt, children }: Props) {
  return (
    <main id="main-content" className="min-h-screen px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          홈으로 돌아가기
        </Link>

        <section className="mt-6 rounded-[30px] border border-white/10 bg-[rgba(9,17,29,0.8)] p-6 shadow-[0_24px_72px_rgba(4,10,20,0.28)] backdrop-blur-xl sm:p-8">
          <p className="text-xs font-semibold tracking-[0.22em] text-slate-400">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">{description}</p>
          <p className="mt-3 text-xs text-slate-500">업데이트: {updatedAt}</p>
          <div className="mt-8 space-y-6 text-sm leading-7 text-slate-200 sm:text-base">{children}</div>
        </section>
      </div>
    </main>
  );
}
