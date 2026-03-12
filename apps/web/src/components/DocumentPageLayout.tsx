import Link from "next/link";
import type { ReactNode } from "react";

import BackButton from "./BackButton";

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
        <div className="flex flex-wrap gap-2">
          <BackButton
            fallbackHref="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/16 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
          />
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/8 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-white/24 hover:bg-white/12 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
          >
            홈으로 돌아가기
          </Link>
        </div>

        <section className="mt-6 rounded-[30px] border border-white/10 bg-[rgba(9,17,29,0.8)] p-6 shadow-[0_24px_72px_rgba(4,10,20,0.28)] backdrop-blur-xl sm:p-8">
          <p className="text-xs font-semibold tracking-[0.22em] text-slate-200">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-100 sm:text-base">{description}</p>
          <p className="mt-3 text-xs font-medium text-slate-300">업데이트: {updatedAt}</p>
          <div className="mt-8 space-y-6 text-sm leading-7 text-slate-100 sm:text-base">{children}</div>
        </section>
      </div>
    </main>
  );
}
