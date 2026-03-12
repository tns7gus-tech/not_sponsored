import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import AnalyticsViewTracker from "@/components/AnalyticsViewTracker";
import BackButton from "@/components/BackButton";
import { getGuideBySlug, GUIDES } from "@/lib/guides";
import { SITE_NAME, getSiteUrl } from "@/lib/site";

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return {
      title: "가이드를 찾을 수 없습니다",
    };
  }

  return {
    title: guide.title,
    description: guide.description,
    alternates: {
      canonical: `/guides/${guide.slug}`,
    },
    openGraph: {
      title: `${guide.title} | ${SITE_NAME}`,
      description: guide.description,
      url: `${getSiteUrl()}/guides/${guide.slug}`,
      type: "article",
    },
  };
}

export default async function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    inLanguage: "ko-KR",
    author: {
      "@type": "Organization",
      name: SITE_NAME,
    },
  };

  return (
    <main id="main-content" className="min-h-screen px-5 py-8 sm:px-6 sm:py-10">
      <AnalyticsViewTracker eventType="page_view_guide_detail" details={{ slug: guide.slug }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex flex-wrap gap-2">
          <BackButton fallbackHref="/guides" />
          <Link
            href="/guides"
            className="inline-flex items-center gap-2 rounded-full border border-[#d7dde5] bg-white px-4 py-2 text-sm font-semibold text-[#243240] shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition hover:bg-[#f8fafb] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3182f61f]"
          >
            가이드 목록으로
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#d7dde5] bg-white px-4 py-2 text-sm font-semibold text-[#243240] shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition hover:bg-[#f8fafb] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3182f61f]"
          >
            홈으로
          </Link>
        </div>

        <article className="mt-6 rounded-[32px] border border-[#e5e8eb] bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.06)] sm:p-8">
          <div className="flex flex-wrap gap-2">
            {guide.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-[#eef2f6] px-3 py-1 text-xs font-medium text-[#243240]">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[#191f28]">{guide.title}</h1>
          <p className="mt-4 text-base leading-8 text-[#334155]">{guide.description}</p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm font-medium text-[#5b6675]">
            <span>업데이트 {guide.updatedAt}</span>
            <span>읽는 시간 {guide.readTime}</span>
          </div>

          <div className="mt-10 space-y-10">
            {guide.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#191f28]">{section.heading}</h2>
                <div className="mt-4 space-y-4 text-base leading-8 text-[#27364a]">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {section.bullets && (
                  <ul className="mt-5 space-y-3 rounded-[24px] border border-[#e6ecf3] bg-[#f7f9fc] p-5 text-sm leading-7 text-[#27364a]">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3">
                        <span className="mt-2 h-2 w-2 rounded-full bg-[#3182f6]" aria-hidden="true" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <div className="mt-10 rounded-[24px] border border-[#dbeafe] bg-[#f5f9ff] p-5">
            <h2 className="text-xl font-semibold text-[#191f28]">이 주제로 바로 리서치해보기</h2>
            <p className="mt-3 text-sm leading-7 text-[#334155]">
              가이드를 읽고 끝내지 말고, 아래 검색으로 실제 결과를 바로 확인해 보세요.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/?q=${encodeURIComponent(guide.queryHint)}&source=guide`}
                className="rounded-full bg-[#3182f6] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2272eb] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3182f61f]"
              >
                {guide.queryHint} 검색하기
              </Link>
              <Link
                href="/"
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#243240] transition hover:bg-[#eef4ff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3182f61f]"
              >
                홈으로 이동
              </Link>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
