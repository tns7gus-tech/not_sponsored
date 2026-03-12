import Link from "next/link";

import { getContactEmail } from "@/lib/site";

export const CONTACT_EMAIL = getContactEmail();

const FOOTER_LINKS = [
  { href: "/guides", label: "공개 가이드" },
  { href: "/privacy", label: "개인정보 처리방침" },
  { href: "/terms", label: "이용 안내" },
  { href: "/corrections", label: "정정/삭제 요청" },
] as const;

export default function SiteFooter() {
  return (
    <footer className="border-t border-[#e5e8eb] bg-white/72 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#191f28]">Not Sponsored</p>
          <p className="mt-1 text-sm text-[#5b6675]">공개 검색 결과와 공개 URL만 다루는 구매 리서치 서비스</p>
          <p className="mt-2 max-w-md text-xs leading-5 text-[#5b6675]">
            자동 추정 결과이며 사실 확정이나 법적 판단 용도로 제공하지 않습니다. 문의와 정정/삭제 요청은 아래 링크 또는 이메일로 받습니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#4e5968]">
          {FOOTER_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-[#191f28] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3182f61f]">
              {item.label}
            </Link>
          ))}
          <a href={`mailto:${CONTACT_EMAIL}`} className="transition hover:text-[#191f28] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3182f61f]">
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </footer>
  );
}
