import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Not Sponsored - 신뢰도 기반 구매 리서치 에이전트",
  description: "광고/협찬 가능성이 낮고 근거가 투명한 후기를 우선 탐색하는 AI 리서치 에이전트",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-gray-950 text-white antialiased min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* 배경 그라디언트 */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        </div>
        {children}
      </body>
    </html>
  );
}
