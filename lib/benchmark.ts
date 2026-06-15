import { PathId } from "./history";

// Seeded, indicative distribution of NZ maturity scores until real aggregate
// data accrues (Phase 4 backend). Values are the cumulative % of organisations
// scoring at or below each 10-point mark — i.e. the percentile you'd sit at.
// IT (technical) is centred slightly lower because the bar is stricter.
const CDF: Record<PathId, number[]> = {
  // score: 0   10  20  30  40  50  60  70  80  90  100
  business: [1, 4, 10, 20, 34, 50, 66, 80, 90, 97, 100],
  it: [2, 8, 18, 32, 48, 64, 78, 88, 94, 98, 100],
};

export interface Benchmark {
  /** % of similar NZ organisations you're ahead of (0–100). */
  percentile: number;
  /** Plain sentence for display. */
  blurb: string;
  /** True when modelled (seeded); false when computed from live submissions. */
  indicative: boolean;
}

/** Live benchmarking switches on once we have at least this many submissions. */
export const MIN_LIVE_SAMPLE = 30;

/** Percentage of sample scores strictly below `value` (0–100). */
export function percentileWithin(scores: number[], value: number): number {
  if (scores.length === 0) return 0;
  const below = scores.filter((s) => s < value).length;
  return Math.round((below / scores.length) * 100);
}

/** Linear-interpolated percentile for a 0–100 score against the seeded CDF. */
export function benchmarkPercentile(path: PathId, overallPct: number): number {
  const table = CDF[path] ?? CDF.business;
  const x = Math.max(0, Math.min(100, overallPct));
  const i = Math.min(Math.floor(x / 10), 9);
  const lo = table[i];
  const hi = table[i + 1];
  const frac = (x - i * 10) / 10;
  return Math.round(lo + (hi - lo) * frac);
}

/** Build a Benchmark (blurb + flags) from an already-computed percentile. */
export function describeBenchmark(
  path: PathId,
  percentile: number,
  indicative: boolean
): Benchmark {
  const who = path === "it" ? "NZ organisations" : "NZ businesses";
  let blurb: string;
  if (percentile >= 75) blurb = `You're ahead of about ${percentile}% of similar ${who} — strong.`;
  else if (percentile >= 50) blurb = `You're ahead of about ${percentile}% of similar ${who} — around the middle of the pack.`;
  else blurb = `You're ahead of about ${percentile}% of similar ${who} — there's clear room to improve.`;
  return { percentile, blurb, indicative };
}

/** Seeded (modelled) benchmark — the fallback used until live data accrues. */
export function benchmark(path: PathId, overallPct: number): Benchmark {
  return describeBenchmark(path, benchmarkPercentile(path, overallPct), true);
}
