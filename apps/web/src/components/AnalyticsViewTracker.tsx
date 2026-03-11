"use client";

import { useEffect } from "react";

import { trackEvent } from "@/lib/analytics";

interface Props {
  eventType: string;
  details?: Record<string, unknown>;
}

export default function AnalyticsViewTracker({ eventType, details }: Props) {
  useEffect(() => {
    void trackEvent(eventType, { details });
  }, [details, eventType]);

  return null;
}
