/**
 * API 클라이언트 유틸리티
 * 백엔드 API 호출을 위한 함수 모음
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** 검색 결과 소스 타입 */
export interface SourceResult {
  id: string;
  platform: string;
  url: string;
  title: string;
  author_name?: string;
  published_at?: string;
  snippet?: string;
  media_types?: string[];
  engagement?: {
    likes?: number;
    comments?: number;
    views?: number;
  };
}

/** 검색 진행 상태 */
export interface SearchProgress {
  connectors_done: number;
  connectors_total: number;
  results_collected: number;
}

/** 검색 요약 */
export interface SearchSummary {
  total_results: number;
  platforms: string[];
}

/** 검색 작업 상세 응답 */
export interface SearchJobDetail {
  job_id: string;
  status: "queued" | "running" | "completed" | "failed";
  query: string;
  expanded_queries?: string[];
  progress?: SearchProgress;
  summary?: SearchSummary;
  results: SourceResult[];
  created_at?: string;
  finished_at?: string;
  error_message?: string;
}

/** 검색 시작 */
export async function createSearch(query: string): Promise<{ job_id: string; status: string }> {
  const res = await fetch(`${API_BASE}/api/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`검색 요청 실패: ${res.status}`);
  return res.json();
}

/** 검색 결과 조회 */
export async function getSearchResults(
  jobId: string,
  platform?: string
): Promise<SearchJobDetail> {
  const params = new URLSearchParams();
  if (platform) params.set("platform", platform);
  const url = `${API_BASE}/api/search/${jobId}${params.toString() ? `?${params}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`결과 조회 실패: ${res.status}`);
  return res.json();
}

/** 플랫폼 표시명 매핑 */
export const PLATFORM_LABELS: Record<string, string> = {
  naver_blog: "네이버 블로그",
  naver_cafe: "네이버 카페",
  naver_news: "네이버 뉴스",
  naver_shopping: "네이버 쇼핑",
  youtube: "YouTube",
  web: "웹",
};

/** 플랫폼 컬러 매핑 */
export const PLATFORM_COLORS: Record<string, string> = {
  naver_blog: "#03C75A",
  naver_cafe: "#03C75A",
  naver_news: "#03C75A",
  naver_shopping: "#03C75A",
  youtube: "#FF0000",
  web: "#4285F4",
};
