function getApiBase(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname.includes("railway.app")) {
      return "https://notsponsoredbackend-production.up.railway.app";
    }
  }

  return "http://localhost:8000";
}

export const API_BASE = getApiBase();

export class ApiError extends Error {
  status: number;
  detail?: string;

  constructor(status: number, message: string, detail?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

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
  crs?: number;
  eqs?: number;
  scs?: number;
  tss?: number;
  tier?: string;
  explanations?: string[];
}

export interface SearchProgress {
  connectors_done: number;
  connectors_total: number;
  results_collected: number;
}

export interface SearchSummary {
  total_results: number;
  platforms: string[];
  platform_counts?: Record<string, number>;
  tier_distribution?: Record<string, number>;
  pros?: string[];
  cons?: string[];
  overall_status?: string;
}

export interface SearchPagination {
  page: number;
  page_size: number;
  total_results: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface SearchJobDetail {
  job_id: string;
  status: "queued" | "running" | "completed" | "failed";
  query: string;
  expanded_queries?: string[];
  progress?: SearchProgress;
  summary?: SearchSummary;
  pagination?: SearchPagination;
  results: SourceResult[];
  created_at?: string;
  finished_at?: string;
  error_message?: string;
}

export interface UrlAnalysisJobDetail {
  job_id: string;
  status: "queued" | "running" | "completed" | "failed";
  url: string;
  result?: SourceResult;
  created_at?: string;
  finished_at?: string;
  error_message?: string;
}

export async function createSearch(query: string): Promise<{ job_id: string; status: string }> {
  const res = await fetch(`${API_BASE}/api/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    await throwApiError(res, "검색 요청을 처리하지 못했습니다.");
  }

  return res.json();
}

export async function getSearchResults(
  jobId: string,
  options?: {
    platform?: string | null;
    page?: number;
    pageSize?: number;
    sortBy?: "relevance" | "trust";
    highTrustOnly?: boolean;
  },
): Promise<SearchJobDetail> {
  const params = new URLSearchParams();

  if (options?.platform) {
    params.set("platform", options.platform);
  }

  if (options?.page) {
    params.set("page", String(options.page));
  }

  if (options?.pageSize) {
    params.set("page_size", String(options.pageSize));
  }

  if (options?.sortBy) {
    params.set("sort_by", options.sortBy);
  }

  if (options?.highTrustOnly) {
    params.set("high_trust_only", "true");
  }

  const url = `${API_BASE}/api/search/${jobId}${params.toString() ? `?${params}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) {
    await throwApiError(res, "검색 결과를 불러오지 못했습니다.");
  }

  return res.json();
}

export async function createUrlAnalysis(url: string): Promise<{ job_id: string; status: string }> {
  const res = await fetch(`${API_BASE}/api/analyze-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    await throwApiError(res, "URL 분석 요청을 처리하지 못했습니다.");
  }

  return res.json();
}

export async function getUrlAnalysis(jobId: string): Promise<UrlAnalysisJobDetail> {
  const res = await fetch(`${API_BASE}/api/analyze-url/${jobId}`);
  if (!res.ok) {
    await throwApiError(res, "URL 분석 결과를 불러오지 못했습니다.");
  }

  return res.json();
}

export async function submitFeedback(
  feedbackType: "helpful" | "ad_suspected",
  sourceResultId?: string,
  url?: string,
): Promise<{ id: string; status: string }> {
  const res = await fetch(`${API_BASE}/api/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      feedback_type: feedbackType,
      source_result_id: sourceResultId,
      url,
    }),
  });

  if (!res.ok) {
    await throwApiError(res, "피드백을 제출하지 못했습니다.");
  }

  return res.json();
}

export const PLATFORM_LABELS: Record<string, string> = {
  naver_blog: "네이버 블로그",
  naver_cafe: "네이버 카페",
  naver_news: "네이버 뉴스",
  naver_shopping: "네이버 쇼핑",
  youtube: "YouTube",
  web: "웹",
  web_analysis: "웹 페이지",
};

export const PLATFORM_COLORS: Record<string, string> = {
  naver_blog: "#03C75A",
  naver_cafe: "#03C75A",
  naver_news: "#03C75A",
  naver_shopping: "#03C75A",
  youtube: "#FF0000",
  web: "#4285F4",
  web_analysis: "#38BDF8",
};

export async function getTrendingSearches(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/api/search/trending`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      await throwApiError(res, "추천 검색어를 불러오지 못했습니다.");
    }

    return res.json();
  } catch (error) {
    console.warn("Failed to fetch trending searches. Falling back to local suggestions.", error);
    return [];
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiError) {
    return error.detail || error.message || fallbackMessage;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

async function throwApiError(res: Response, fallbackMessage: string): Promise<never> {
  let detail: string | undefined;

  try {
    detail = extractApiErrorDetail(await res.json());
  } catch {
    detail = undefined;
  }

  throw new ApiError(res.status, detail || `${fallbackMessage} (${res.status})`, detail);
}

function extractApiErrorDetail(payload: unknown): string | undefined {
  if (typeof payload === "string") {
    return payload;
  }

  if (Array.isArray(payload)) {
    const messages = payload
      .map((item) => extractApiErrorDetail(item))
      .filter((value): value is string => Boolean(value));

    return messages.length > 0 ? messages.join(" / ") : undefined;
  }

  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const record = payload as Record<string, unknown>;

  if ("detail" in record) {
    return extractApiErrorDetail(record.detail);
  }

  if ("msg" in record && typeof record.msg === "string") {
    return record.msg;
  }

  return undefined;
}
