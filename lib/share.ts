import { AssessmentResult } from "./types";
import { PathId } from "./history";

/** Minimal, score-only payload that can be encoded into a shareable URL. */
export interface SharePayload {
  path: PathId;
  pct: number;
  level: number;
  label: string;
  cats: { label: string; pct: number }[];
}

export function buildSharePayload(path: PathId, result: AssessmentResult): SharePayload {
  return {
    path,
    pct: result.maturity.overallPct,
    level: result.maturity.level,
    label: result.maturity.levelLabel,
    cats: result.maturity.categoryScores.map((c) => ({ label: c.ownerLabel, pct: c.scorePct })),
  };
}

const toUrlSafe = (b64: string) =>
  b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromUrlSafe = (s: string) => s.replace(/-/g, "+").replace(/_/g, "/");

/** Encode a payload to a compact, URL-safe, unicode-safe token. */
export function encodeShare(payload: SharePayload): string {
  const json = JSON.stringify(payload);
  return toUrlSafe(btoa(encodeURIComponent(json)));
}

/** Decode a token back to a payload, or null if it's malformed/tampered. */
export function decodeShare(token: string): SharePayload | null {
  try {
    if (!token) return null;
    const payload = JSON.parse(decodeURIComponent(atob(fromUrlSafe(token)))) as SharePayload;
    if (typeof payload.pct !== "number" || !Array.isArray(payload.cats)) return null;
    return payload;
  } catch {
    return null;
  }
}
