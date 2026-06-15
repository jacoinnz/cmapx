import {
  IT_STANDARDS,
  itAnswerScale,
  itCategories,
  itQuestions,
} from "./itQuestions";

const validIds = new Set(itCategories.map((c) => c.id));

describe("IT question content integrity", () => {
  it("has nine control domains, each with a threat", () => {
    expect(itCategories).toHaveLength(9);
    itCategories.forEach((c) => {
      expect(c.ownerLabel.length).toBeGreaterThan(0);
      expect(c.threat.length).toBeGreaterThan(0);
    });
  });

  it("covers network/boundary controls: segmentation, email auth and firewall", () => {
    const networkCat = itCategories.find((c) => c.id === "network");
    expect(networkCat).toBeDefined();
    const blob = itQuestions
      .filter((q) => q.categoryId === "network")
      .map((q) => `${q.text} ${q.helpText}`)
      .join(" ")
      .toLowerCase();
    expect(blob).toContain("segment");
    expect(blob).toContain("dmarc");
    expect(blob).toContain("firewall");
  });

  it("covers the backlog topics: MDM, secure development, cloud config and AI/shadow IT", () => {
    const blob = itQuestions.map((q) => `${q.text} ${q.helpText}`).join(" ").toLowerCase();
    expect(blob).toMatch(/mdm|mobile device|uem/);
    expect(blob).toMatch(/secure development|sdlc|software development/);
    expect(blob).toMatch(/cloud|saas/);
    expect(blob).toMatch(/\bai\b|shadow it|generative/);
  });

  it("has ~40 maturity questions, each fully specified", () => {
    expect(itQuestions.length).toBeGreaterThanOrEqual(38);
    expect(itQuestions.length).toBeLessThanOrEqual(50);
    itQuestions.forEach((q) => {
      expect(q.kind).toBe("maturity");
      expect(validIds.has(q.categoryId)).toBe(true);
      expect(Boolean(q.helpText && q.helpText.trim())).toBe(true);
      expect(Boolean(q.recommendation && q.recommendation.trim())).toBe(true);
      expect((q.standards ?? []).length).toBeGreaterThan(0);
      expect(q.weight).toBeGreaterThan(0);
    });
  });

  it("every question maps only to recognised NZ standards", () => {
    const known = new Set(IT_STANDARDS);
    itQuestions.forEach((q) => {
      (q.standards ?? []).forEach((s) => expect(known.has(s)).toBe(true));
    });
  });

  it("represents all five standards across the question set", () => {
    IT_STANDARDS.forEach((std) => {
      expect(itQuestions.some((q) => (q.standards ?? []).includes(std))).toBe(true);
    });
  });

  it("uses a 4-level maturity scale with credits from 0 to 1", () => {
    expect(itAnswerScale).toHaveLength(4);
    expect(Math.min(...itAnswerScale.map((o) => o.credit))).toBe(0);
    expect(Math.max(...itAnswerScale.map((o) => o.credit))).toBe(1);
  });

  it("uses unique question ids", () => {
    const ids = itQuestions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("offers an N/A option on the conditional secure-development question", () => {
    const sdlc = itQuestions.find((q) => q.id === "gov_sdlc")!;
    expect(sdlc.scale?.some((o) => o.value === "na")).toBe(true);
  });
});
