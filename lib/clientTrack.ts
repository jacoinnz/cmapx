// Client-only, anonymous event buffering. The session id is a random value in
// localStorage — not identity. Nothing here reads personal data.

interface QueuedEvent {
  sessionId: string;
  type: string;
  label?: string;
  path?: string;
  step?: number;
}

let queue: QueuedEvent[] = [];

function sessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let sid = localStorage.getItem("cmap:sid");
    if (!sid) {
      sid = (crypto.randomUUID?.() ?? String(Date.now()) + Math.round(performance.now()));
      localStorage.setItem("cmap:sid", sid);
    }
    return sid;
  } catch {
    return "anon";
  }
}

/** Map a pathname to a coarse path label for grouping. */
export function pathLabel(pathname: string): string {
  if (pathname.startsWith("/business")) return "business";
  if (pathname.startsWith("/it")) return "it";
  if (pathname.startsWith("/account")) return "account";
  if (pathname.startsWith("/signin")) return "signin";
  if (pathname.startsWith("/shared")) return "shared";
  return "home";
}

export function track(type: string, props: { label?: string; path?: string; step?: number } = {}) {
  if (typeof window === "undefined") return;
  queue.push({ sessionId: sessionId(), type, ...props });
  if (queue.length >= 10) flush();
}

export function flush(useBeacon = false) {
  if (typeof window === "undefined" || queue.length === 0) return;
  const body = JSON.stringify({ events: queue });
  queue = [];
  try {
    if (useBeacon && navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    /* analytics must never break the app */
  }
}
