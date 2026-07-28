const ANONYMOUS_ID_KEY = "analytics_anonymous_id";
const SESSION_ID_KEY = "analytics_session_id";

function createId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getAnonymousId() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    let anonymousId = localStorage.getItem(ANONYMOUS_ID_KEY);

    if (!anonymousId) {
      anonymousId = createId();
      localStorage.setItem(ANONYMOUS_ID_KEY, anonymousId);
    }

    return anonymousId;
  } catch {
    // localStorage may be unavailable in private or restricted browsers.
    return createId();
  }
}

export function getAnalyticsSessionId() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    let sessionId = sessionStorage.getItem(SESSION_ID_KEY);

    if (!sessionId) {
      sessionId = createId();
      sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    }

    return sessionId;
  } catch {
    return createId();
  }
}