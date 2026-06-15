import { render, screen } from "@testing-library/react";
import PathBridge, { itBridgeCopy } from "./PathBridge";

describe("itBridgeCopy", () => {
  it("nudges high-maturity owners to go deeper (Managed/Strong)", () => {
    [4, 5].forEach((level) => {
      const c = itBridgeCopy(level);
      expect(c.title.toLowerCase()).toContain("covered");
      expect(c.cta.toLowerCase()).toContain("technical");
    });
  });

  it("frames the technical path as a future step for lower maturity", () => {
    [1, 2, 3].forEach((level) => {
      const c = itBridgeCopy(level);
      expect(c.title.toLowerCase()).toMatch(/deeper|technical/);
      expect(c.cta.toLowerCase()).toContain("technical");
    });
  });
});

describe("PathBridge", () => {
  it("links to the IT assessment", () => {
    render(<PathBridge level={3} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/it");
  });
});
