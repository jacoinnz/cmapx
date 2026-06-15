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
  /** Always true for now — flags this as a model, not live data. */
  indicative: boolean;
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

export function benchmark(path: PathId, overallPct: number): Benchmark {
  const percentile = benchmarkPercentile(path, overallPct);
  const who = path === "it" ? "NZ organisations" : "NZ businesses";
  let blurb: string;
  if (percentile >= 75) blurb = `You're ahead of about ${percentile}% of similar ${who} — strong.`;
  else if (percentile >= 50) blurb = `You're ahead of about ${percentile}% of similar ${who} — around the middle of the pack.`;
  else blurb = `You're ahead of about ${percentile}% of similar ${who} — there's clear room to improve.`;
  return { percentile, blurb, indicative: true };
}
