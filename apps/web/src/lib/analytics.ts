import { API_BASE } from "@/lib/api";

export interface AnalyticsPayload {
  pagePath?: string;
  referrer?: string;
  queryText?: string;
  jobId?: string;
  details?: Record<string, unknown>;
}

const SESSION_KEY = "not_sponsored_session_id";

export function getAnalyticsSessionId() {
  if (typeof window === "undefined") {
    return undefined;
  }

  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing) {
    return existing;
  }

  const next = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(SESSION_KEY, next);
  return next;
}

export async function trackEvent(eventType: string, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    await fetch(`${API_BASE}/api/analytics/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type: eventType,
        page_path: payload.pagePath ?? window.location.pathname,
        referrer: payload.referrer ?? (document.referrer || undefined),
        session_id: getAnalyticsSessionId(),
        query_text: payload.queryText,
        job_id: payload.jobId,
        details: payload.details,
      }),
      keepalive: true,
    });
  } catch (error) {
    console.warn("Analytics event failed", error);
  }
}
