export const SITE_NAME = "Not Sponsored";
export const SITE_TAGLINE = "광고 문구보다 실사용 근거를 먼저 보여주는 구매 리서치";
export const SITE_DESCRIPTION =
  "네이버, 유튜브, 공개 URL에서 광고성 신호와 실사용 근거를 함께 정리해 보여주는 구매 리서치 도구";

const DEFAULT_SITE_URL = "https://notsponsoredfront-production.up.railway.app";

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
}

export function getContactEmail() {
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@notsponsored.example";
}
