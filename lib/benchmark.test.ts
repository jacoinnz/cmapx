import { benchmarkPercentile, benchmark } from "./benchmark";

describe("benchmarkPercentile", () => {
  it("maps a mid score to roughly the middle of the pack", () => {
    expect(benchmarkPercentile("business", 50)).toBe(50);
  });

  it("rewards a high score with a high percentile", () => {
    expect(benchmarkPercentile("business", 80)).toBe(90);
  });

  it("interpolates between table points", () => {
    // business CDF 40->34, 50->50, so 45 -> 42
    expect(benchmarkPercentile("business", 45)).toBe(42);
  });

  it("rates the IT path on a stricter curve than business at the same score", () => {
    expect(benchmarkPercentile("it", 50)).toBeGreaterThan(benchmarkPercentile("business", 50));
  });

  it("clamps out-of-range scores", () => {
    expect(benchmarkPercentile("business", -10)).toBe(1);
    expect(benchmarkPercentile("business", 130)).toBe(100);
  });
});

describe("benchmark", () => {
  it("flags the result as indicative and includes a percentile blurb", () => {
    const b = benchmark("business", 80);
    expect(b.indicative).toBe(true);
    expect(b.percentile).toBe(90);
    expect(b.blurb).toMatch(/90%/);
  });
});
