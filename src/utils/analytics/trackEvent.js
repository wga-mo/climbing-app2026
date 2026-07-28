import { supabase } from "@/lib/supabase";
import {
  getAnalyticsSessionId,
  getAnonymousId,
} from "@/utils/analytics/visitorIds";

export async function trackEvent(eventName, data = {}) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const payload = {
      eventName,
      anonymousId: getAnonymousId(),
      sessionId: getAnalyticsSessionId(),

      hostname: window.location.host,
      pagePath: window.location.pathname,

      cragId: data.cragId ?? null,
      sectorId: data.sectorId ?? null,
      routeId: data.routeId ?? null,

      properties: data.properties ?? {},
    };

    const headers = {
      "Content-Type": "application/json",
    };

    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    const response = await fetch("/api/analytics/event", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      keepalive: true,
    });

    if (!response.ok && process.env.NODE_ENV === "development") {
      const result = await response.json().catch(() => null);

      console.warn(
        "Analytics event was not recorded:",
        eventName,
        response.status,
        result
      );
    }
  } catch (error) {
    // Analytics must never interfere with normal website use.
    if (process.env.NODE_ENV === "development") {
      console.warn("Analytics request failed:", eventName, error);
    }
  }
}