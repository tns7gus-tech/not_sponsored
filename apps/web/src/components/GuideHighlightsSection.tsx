import Link from "next/link";

import { GUIDES } from "@/lib/guides";

export default function GuideHighlightsSection() {
  return (
    <section aria-labelledby="guide-highlights-title" className="mx-auto mt-14 w-full max-w-6xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-[#6b7684]">공개 가이드</p>
          <h2 id="guide-highlights-title" className="mt-2 text-2xl font-semibold text-[#191f28]">
            검색 유입을 위한 공개 콘텐츠
          </h2>
        </div>
        <Link
          href="/guides"
          className="text-sm font-semibold text-[#1d4ed8] transition hover:text-[#1e40af] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3182f61f]"
        >
          전체 가이드 보기
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {GUIDES.map((guide) => (
          <article
            key={guide.slug}
            className="rounded-[24px] border border-white/10 bg-[rgba(9,18,30,0.72)] p-5 shadow-[0_16px_48px_rgba(4,10,20,0.24)] backdrop-blur-xl"
          >
            <div className="flex flex-wrap gap-2">
              {guide.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs text-white">
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="mt-4 text-xl font-semibold text-white">{guide.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-100">{guide.excerpt}</p>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-200">
              <span>{guide.readTime}</span>
              <span>{guide.updatedAt}</span>
            </div>
            <Link
              href={`/guides/${guide.slug}`}
              className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
            >
              가이드 읽기
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
