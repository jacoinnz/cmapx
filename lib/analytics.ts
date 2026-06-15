// Pure aggregation over anonymous behavioural events. No identity, no IP.

export interface EventRow {
  sessionId: string;
  type: string; // session_start | section_view | assessment_complete | click
  label?: string | null;
  path?: string | null;
  step?: number | null;
}

export interface PathCompletion {
  started: number;
  completed: number;
  /** completed / started, 0–100. */
  rate: number;
}

export interface FunnelStep {
  step: number;
  /** Distinct sessions that reached this section or further. */
  reached: number;
}

export interface DropStep {
  step: number;
  reached: number;
  /** Sessions that got to this section but no further. */
  dropped: number;
  /** dropped / reached, 0–100. */
  dropPct: number;
}

const forPath = (events: EventRow[], path: string) =>
  events.filter((e) => (e.path ?? "") === path);

/** Highest section index each session viewed, on a path. */
function maxStepBySession(events: EventRow[], path: string): Map<string, number> {
  const m = new Map<string, number>();
  for (const e of forPath(events, path)) {
    if (e.type === "section_view" && typeof e.step === "number") {
      m.set(e.sessionId, Math.max(m.get(e.sessionId) ?? 0, e.step));
    } else if (!m.has(e.sessionId)) {
      m.set(e.sessionId, 0);
    }
  }
  return m;
}

function completedSessions(events: EventRow[], path: string): Set<string> {
  return new Set(
    forPath(events, path)
      .filter((e) => e.type === "assessment_complete")
      .map((e) => e.sessionId)
  );
}

export function completionByPath(events: EventRow[]): Record<string, PathCompletion> {
  const paths = new Set(events.map((e) => e.path ?? "").filter(Boolean));
  const out: Record<string, PathCompletion> = {};
  for (const p of paths) {
    const started = new Set(forPath(events, p).map((e) => e.sessionId)).size;
    const completed = completedSessions(events, p).size;
    out[p] = { started, completed, rate: started ? Math.round((completed / started) * 100) : 0 };
  }
  return out;
}

export function funnelByPath(events: EventRow[], path: string): FunnelStep[] {
  const maxStep = maxStepBySession(events, path);
  const maxSeen = Math.max(0, ...[...maxStep.values()]);
  const steps: FunnelStep[] = [];
  for (let k = 0; k <= maxSeen; k++) {
    const reached = [...maxStep.values()].filter((m) => m >= k).length;
    steps.push({ step: k, reached });
  }
  return steps;
}

export function dropOff(events: EventRow[], path: string): DropStep[] {
  const funnel = funnelByPath(events, path);
  const completed = completedSessions(events, path).size;
  return funnel.map((f, i) => {
    const next = funnel[i + 1]?.reached ?? completed; // last section drops to "completed"
    const dropped = Math.max(0, f.reached - next);
    return {
      step: f.step,
      reached: f.reached,
      dropped,
      dropPct: f.reached ? Math.round((dropped / f.reached) * 100) : 0,
    };
  });
}

/** The section index where the most sessions abandon (earliest on ties). */
export function biggestDropStep(events: EventRow[], path: string): number | null {
  const d = dropOff(events, path);
  if (!d.length) return null;
  let best = d[0];
  for (const s of d) if (s.dropped > best.dropped) best = s;
  return best.dropped > 0 ? best.step : null;
}

export function clicksPerButton(events: EventRow[]): { label: string; count: number }[] {
  const m = new Map<string, number>();
  for (const e of events) {
    if (e.type === "click" && e.label) m.set(e.label, (m.get(e.label) ?? 0) + 1);
  }
  return [...m.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export function clicksPerSession(events: EventRow[]): {
  sessions: number;
  totalClicks: number;
  avg: number;
} {
  const m = new Map<string, number>();
  for (const e of events) {
    if (e.type === "click") m.set(e.sessionId, (m.get(e.sessionId) ?? 0) + 1);
  }
  const sessions = m.size;
  const totalClicks = [...m.values()].reduce((a, b) => a + b, 0);
  return { sessions, totalClicks, avg: sessions ? Math.round((totalClicks / sessions) * 10) / 10 : 0 };
}
