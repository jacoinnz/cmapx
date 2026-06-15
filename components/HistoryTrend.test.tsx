import { render, screen } from "@testing-library/react";
import HistoryTrend from "./HistoryTrend";
import { Snapshot } from "@/lib/history";

const snap = (pct: number, takenAt: string): Snapshot => ({
  path: "business",
  takenAt,
  overallPct: pct,
  level: 3,
  levelLabel: "Developing",
  categories: [],
});

describe("HistoryTrend", () => {
  it("lists past checks with each score and a delta from the previous one", () => {
    render(
      <HistoryTrend
        history={[snap(62, "2026-06-01T00:00:00Z"), snap(48, "2026-03-01T00:00:00Z")]}
      />
    );
    expect(screen.getByText("62%")).toBeInTheDocument();
    expect(screen.getByText("48%")).toBeInTheDocument();
    // newest row improved by 14 points over the older one
    expect(screen.getByText("▲14")).toBeInTheDocument();
  });
});
