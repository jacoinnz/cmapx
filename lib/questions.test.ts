import { categories, questions } from "./questions";
import { scoreAssessment } from "./scoring";
import { AnswerMap, CategoryId } from "./types";

const validIds = new Set(categories.map((c) => c.id));

describe("question content integrity", () => {
  it("has the six owner-facing categories", () => {
    expect(categories).toHaveLength(6);
    categories.forEach((c) => {
      expect(c.ownerLabel.length).toBeGreaterThan(0);
      expect(c.threat.length).toBeGreaterThan(0);
    });
  });

  it("has 25–30 maturity questions, each with a recommendation and valid category", () => {
    const maturity = questions.filter((q) => q.kind === "maturity");
    expect(maturity.length).toBeGreaterThanOrEqual(25);
    expect(maturity.length).toBeLessThanOrEqual(30);
    maturity.forEach((q) => {
      expect(validIds.has(q.categoryId as CategoryId)).toBe(true);
      expect(q.recommendation && q.recommendation.length).toBeTruthy();
      expect(q.weight).toBeGreaterThan(0);
    });
  });

  it("has exposure questions with reasons, including a Privacy Act 2020 one", () => {
    const exposure = questions.filter((q) => q.kind === "exposure");
    expect(exposure.length).toBeGreaterThanOrEqual(3);
    exposure.forEach((q) => expect(q.exposureReason && q.exposureReason.length).toBeTruthy());
    expect(
      exposure.some((q) => (q.exposureReason ?? "").includes("Privacy Act 2020"))
    ).toBe(true);
  });

  it("uses unique question ids", () => {
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("real content + engine integration", () => {
  it("an all-'no' assessment is the lowest maturity level", () => {
    const answers: AnswerMap = {};
    questions.forEach((q) => (answers[q.id] = "no"));
    const r = scoreAssessment(answers, questions, categories);
    expect(r.maturity.level).toBe(1);
    expect(r.maturity.levelLabel).toBe("Exposed");
    // every category should produce next steps when nothing is in place
    expect(r.nextSteps.length).toBeGreaterThan(0);
  });

  it("an all-'yes' assessment is the highest maturity with no next steps", () => {
    const answers: AnswerMap = {};
    questions.forEach((q) => (answers[q.id] = "yes"));
    const r = scoreAssessment(answers, questions, categories);
    expect(r.maturity.level).toBe(5);
    expect(r.maturity.levelLabel).toBe("Strong");
    expect(r.nextSteps).toHaveLength(0);
    // all "yes" to exposure questions => strong insurance case, Privacy Act surfaced
    expect(r.insurance.rating).toBe("strong");
    expect(r.swot.threats.some((t) => t.includes("Privacy Act 2020"))).toBe(true);
  });
});
