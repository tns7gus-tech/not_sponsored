import type { Metadata, Viewport } from "next";

import SiteFooter from "@/components/SiteFooter";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, getSiteUrl } from "@/lib/site";
import "./globals.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["구매 리서치", "광고 아닌 후기", "실사용 후기", "내돈내산 검색", "리뷰 분석", "후기 비교"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: siteUrl,
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#f2f4f6",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen overflow-x-hidden antialiased">
        <div className="relative flex min-h-screen flex-col">
          <a href="#main-content" className="skip-link">
            본문으로 건너뛰기
          </a>

          <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fc_42%,#f2f4f6_100%)]" />
            <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-[#dbeafe] blur-3xl" />
            <div className="absolute right-[-6rem] top-20 h-80 w-80 rounded-full bg-[#e0ecff] blur-3xl" />
            <div className="absolute bottom-[-8rem] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#eef4ff] blur-3xl" />
          </div>

          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
