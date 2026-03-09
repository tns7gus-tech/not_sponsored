import type { Metadata, Viewport } from "next";

import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "Not Sponsored | 신뢰 기반 구매 리서치",
  description: "광고 가능성과 실제 사용 근거를 분리해 보여주는 구매 리서치 에이전트",
  applicationName: "Not Sponsored",
  keywords: [
    "구매 리서치",
    "광고 판별",
    "리뷰 신뢰도",
    "NAVER 검색",
    "YouTube 리뷰 분석",
  ],
};

export const viewport: Viewport = {
  themeColor: "#06111c",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="dark">
      <body className="min-h-screen overflow-x-hidden antialiased">
        <div className="relative flex min-h-screen flex-col">
          <a href="#main-content" className="skip-link">
            본문으로 건너뛰기
          </a>

          <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_36%),radial-gradient(circle_at_82%_18%,rgba(244,114,182,0.12),transparent_24%),linear-gradient(180deg,#07111d_0%,#020817_55%,#010409_100%)]" />
            <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:72px_72px]" />
            <div className="absolute left-[10%] top-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="absolute right-[12%] top-32 h-56 w-56 rounded-full bg-fuchsia-400/10 blur-3xl" />
            <div className="absolute bottom-[-4rem] left-1/3 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
          </div>

          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
