import Link from "next/link";
import type { Metadata } from "next";

import AnalyticsViewTracker from "@/components/AnalyticsViewTracker";
import BackButton from "@/components/BackButton";
import { GUIDES } from "@/lib/guides";

export const metadata: Metadata = {
  title: "공개 가이드",
  description: "광고 같은 후기 구분법, 실사용 후기 찾는 법, 구매 전 체크리스트를 정리한 공개 가이드 모음",
};

export default function GuidesPage() {
  return (
    <main id="main-content" className="min-h-screen px-5 py-8 sm:px-6 sm:py-10">
      <AnalyticsViewTracker eventType="page_view_guides" />
      <div className="mx-auto w-full max-w-6xl">
        <section className="rounded-[34px] border border-white/12 bg-[linear-gradient(135deg,#07111d_0%,#0b1628_48%,#09131f_100%)] px-5 py-6 shadow-[0_28px_80px_rgba(4,10,20,0.24)] sm:px-8 sm:py-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <BackButton
                fallbackHref="/"
                className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/16 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
              />
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/6 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/12 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
              >
                홈으로
              </Link>
            </div>
            <span className="rounded-full border border-cyan-300/18 bg-cyan-300/12 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-cyan-50">
              공개 가이드
            </span>
          </div>

          <p className="mt-6 text-xs font-semibold tracking-[0.22em] text-slate-200">공개 가이드</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">검색 유입과 전환을 위한 콘텐츠 허브</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-100">
            구매 전 후기 탐색 시간을 줄여주는 공개 가이드입니다. 검색에서 자주 만나는 문제를 설명하고, 각 글 끝에서 바로 리서치를 시작할 수 있게 연결합니다.
          </p>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {GUIDES.map((guide) => (
            <article key={guide.slug} className="rounded-[28px] border border-[#e5e8eb] bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
              <div className="flex flex-wrap gap-2">
                {guide.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-[#eef2f6] px-3 py-1 text-xs font-medium text-[#243240]">
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[#191f28]">{guide.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#334155]">{guide.excerpt}</p>
              <div className="mt-4 flex items-center justify-between text-xs font-medium text-[#5b6675]">
                <span>{guide.readTime}</span>
                <span>{guide.updatedAt}</span>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/guides/${guide.slug}`}
                  className="rounded-full bg-[#191f28] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0f172a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#191f2820]"
                >
                  읽어보기
                </Link>
                <Link
                  href={`/?q=${encodeURIComponent(guide.queryHint)}&source=guide`}
                  className="rounded-full bg-[#eef4ff] px-4 py-2 text-sm font-semibold text-[#1d4ed8] transition hover:bg-[#dbeafe] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3182f61f]"
                >
                  이 주제로 검색
                </Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
