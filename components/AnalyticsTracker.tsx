"use client";

import { useEffect } from "react";
import { track, flush, pathLabel } from "@/lib/clientTrack";

/** Mounted once in the layout: captures anonymous button/link clicks + flushes. */
export default function AnalyticsTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest(
        "button, a, [role=button]"
      ) as HTMLElement | null;
      if (!el) return;
      // Prefer an explicit data-track label, else the trimmed visible text.
      const label = (el.getAttribute("data-track") || el.innerText || el.getAttribute("aria-label") || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 80);
      if (!label) return;
      track("click", { label, path: pathLabel(window.location.pathname) });
    };

    const onHide = () => flush(true);
    const timer = window.setInterval(() => flush(), 3000);

    document.addEventListener("click", onClick, { capture: true });
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush(true);
    });

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("pagehide", onHide);
      flush(true);
    };
  }, []);

  return null;
}
