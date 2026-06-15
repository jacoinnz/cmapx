import {
  toSnapshot,
  saveSnapshot,
  loadHistory,
  previousBefore,
  clearHistory,
  overallDelta,
  PathId,
} from "./history";
import { AssessmentResult } from "./types";

const result = (pct: number): AssessmentResult => ({
  maturity: {
    overallPct: pct,
    level: 3,
    levelLabel: "Developing",
    categoryScores: [
      { categoryId: "access", ownerLabel: "Who can get in", scorePct: pct, level: "developing" },
    ],
  },
  insurance: null,
  swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
  nextSteps: [],
});

beforeEach(() => {
  clearHistory("business" as PathId);
  clearHistory("it" as PathId);
});

describe("toSnapshot", () => {
  it("captures the headline figures and per-category scores", () => {
    const s = toSnapshot("business", result(62), "2026-03-01T00:00:00.000Z");
    expect(s.path).toBe("business");
    expect(s.overallPct).toBe(62);
    expect(s.levelLabel).toBe("Developing");
    expect(s.takenAt).toBe("2026-03-01T00:00:00.000Z");
    expect(s.categories[0]).toEqual({ id: "access", label: "Who can get in", pct: 62 });
  });
});

describe("history persistence", () => {
  it("appends snapshots and reads them back newest-first", () => {
    saveSnapshot(toSnapshot("business", result(40), "2026-01-01T00:00:00.000Z"));
    saveSnapshot(toSnapshot("business", result(55), "2026-03-01T00:00:00.000Z"));
    const h = loadHistory("business");
    expect(h.map((s) => s.overallPct)).toEqual([55, 40]); // newest first
  });

  it("keeps business and IT histories separate", () => {
    saveSnapshot(toSnapshot("business", result(40), "2026-01-01T00:00:00.000Z"));
    saveSnapshot(toSnapshot("it", result(80), "2026-01-01T00:00:00.000Z"));
    expect(loadHistory("business")).toHaveLength(1);
    expect(loadHistory("it")).toHaveLength(1);
  });

  it("caps history to the most recent 20 entries", () => {
    for (let i = 0; i < 25; i++) {
      saveSnapshot(toSnapshot("business", result(i), `2026-01-${String(i + 1).padStart(2, "0")}T00:00:00.000Z`));
    }
    expect(loadHistory("business")).toHaveLength(20);
  });
});

describe("previousBefore / overallDelta", () => {
  it("finds the latest snapshot strictly before a timestamp", () => {
    saveSnapshot(toSnapshot("business", result(40), "2026-01-01T00:00:00.000Z"));
    saveSnapshot(toSnapshot("business", result(55), "2026-03-01T00:00:00.000Z"));
    const prev = previousBefore(loadHistory("business"), "2026-03-01T00:00:00.000Z");
    expect(prev?.overallPct).toBe(40);
  });

  it("returns undefined when there is no earlier snapshot", () => {
    saveSnapshot(toSnapshot("business", result(55), "2026-03-01T00:00:00.000Z"));
    expect(previousBefore(loadHistory("business"), "2026-03-01T00:00:00.000Z")).toBeUndefined();
  });

  it("computes the signed point delta between two scores", () => {
    expect(overallDelta(62, 48)).toBe(14);
    expect(overallDelta(48, 62)).toBe(-14);
  });
});
