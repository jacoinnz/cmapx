import { AssessmentResult } from "./types";

export type PathId = "business" | "it";

/** A saved point-in-time snapshot of a completed assessment (lives in localStorage). */
export interface Snapshot {
  path: PathId;
  /** ISO timestamp. */
  takenAt: string;
  overallPct: number;
  level: number;
  levelLabel: string;
  categories: { id: string; label: string; pct: number }[];
}

const HISTORY_KEY = (p: PathId) => `cmap:history:${p}`;
const DRAFT_KEY = (p: PathId) => `cmap:draft:${p}`;
const MAX_HISTORY = 20;

const store = (): Storage | null =>
  typeof window !== "undefined" ? window.localStorage : null;

const readJSON = <T,>(key: string, fallback: T): T => {
  const s = store();
  if (!s) return fallback;
  try {
    const raw = s.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (key: string, value: unknown): void => {
  const s = store();
  if (!s) return;
  try {
    s.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — fail soft, the app still works */
  }
};

/** Pure: turn a scored result into a storable snapshot. */
export function toSnapshot(
  path: PathId,
  result: AssessmentResult,
  takenAt: string
): Snapshot {
  return {
    path,
    takenAt,
    overallPct: result.maturity.overallPct,
    level: result.maturity.level,
    levelLabel: result.maturity.levelLabel,
    categories: result.maturity.categoryScores.map((c) => ({
      id: c.categoryId,
      label: c.ownerLabel,
      pct: c.scorePct,
    })),
  };
}

/** Newest-first list of saved snapshots for a path. */
export function loadHistory(path: PathId): Snapshot[] {
  const list = readJSON<Snapshot[]>(HISTORY_KEY(path), []);
  return [...list].sort((a, b) => b.takenAt.localeCompare(a.takenAt));
}

/** Append a snapshot, cap to the most recent MAX_HISTORY, and persist. */
export function saveSnapshot(snapshot: Snapshot): Snapshot[] {
  const merged = [...loadHistory(snapshot.path), snapshot]
    .sort((a, b) => b.takenAt.localeCompare(a.takenAt))
    .slice(0, MAX_HISTORY);
  writeJSON(HISTORY_KEY(snapshot.path), merged);
  return merged;
}

export function clearHistory(path: PathId): void {
  store()?.removeItem(HISTORY_KEY(path));
}

/** The latest snapshot strictly older than `takenAt` (the user's previous check). */
export function previousBefore(
  history: Snapshot[],
  takenAt: string
): Snapshot | undefined {
  return history
    .filter((s) => s.takenAt < takenAt)
    .sort((a, b) => b.takenAt.localeCompare(a.takenAt))[0];
}

/** Signed change in percentage points (positive = improvement). */
export function overallDelta(current: number, previous: number): number {
  return current - previous;
}

// ---- In-progress draft (resume support) ----

export interface Draft {
  answers: Record<string, string>;
  savedAt: string;
}

export function saveDraft(path: PathId, answers: Record<string, string>, savedAt: string): void {
  if (Object.keys(answers).length === 0) return;
  writeJSON(DRAFT_KEY(path), { answers, savedAt });
}

export function loadDraft(path: PathId): Draft | null {
  return readJSON<Draft | null>(DRAFT_KEY(path), null);
}

export function clearDraft(path: PathId): void {
  store()?.removeItem(DRAFT_KEY(path));
}
