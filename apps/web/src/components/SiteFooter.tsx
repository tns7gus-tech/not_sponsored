import Link from "next/link";

export const CONTACT_EMAIL = "contact@notsponsored.example";

const FOOTER_LINKS = [
  { href: "/privacy", label: "개인정보처리방침" },
  { href: "/terms", label: "이용약관" },
  { href: "/corrections", label: "정정/삭제 요청" },
] as const;

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/8 bg-[rgba(4,10,18,0.82)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.22em] text-slate-400">Not Sponsored</p>
          <h2 className="mt-2 text-lg font-semibold text-white">공개 근거를 먼저 보여주는 구매 리서치</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            공개 검색 결과와 사용자가 입력한 공개 URL만 분석합니다. 자동 추정 결과이므로 사실 확정이나 법적 판단용으로 사용하면
            안 됩니다.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-white">운영 링크</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-300">
              {FOOTER_LINKS.map((item) => (
                <Link key={item.href} href={item.href} className="transition hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">문의</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-300">
              <a href={`mailto:${CONTACT_EMAIL}`} className="transition hover:text-white">
                {CONTACT_EMAIL}
              </a>
              <p>공개 URL만 분석하며, 로그인 필요 페이지와 비공개 영역은 제외합니다.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
