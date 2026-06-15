import { render, screen } from "@testing-library/react";
import MaturityRadar from "./MaturityRadar";
import { CategoryScore } from "@/lib/types";

const scores: CategoryScore[] = [
  { categoryId: "access", ownerLabel: "Who can get in", scorePct: 80, level: "strength" },
  { categoryId: "backups", ownerLabel: "Your safety net", scorePct: 20, level: "weakness" },
];

describe("MaturityRadar accessibility", () => {
  it("provides a text alternative listing each area's score", () => {
    render(<MaturityRadar scores={scores} />);
    // the visual chart is decorative; the numbers must be available as text
    expect(screen.getByText(/Who can get in: 80%/)).toBeInTheDocument();
    expect(screen.getByText(/Your safety net: 20%/)).toBeInTheDocument();
  });
});
