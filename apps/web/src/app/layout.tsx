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
