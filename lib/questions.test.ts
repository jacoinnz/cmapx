import { businessAnswerScale, exposureAnswerScale, categories, questions } from "./questions";
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

  it("has 25–38 maturity questions, each with a recommendation and valid category", () => {
    const maturity = questions.filter((q) => q.kind === "maturity");
    expect(maturity.length).toBeGreaterThanOrEqual(25);
    expect(maturity.length).toBeLessThanOrEqual(38);
    maturity.forEach((q) => {
      expect(validIds.has(q.categoryId as CategoryId)).toBe(true);
      expect(q.recommendation && q.recommendation.length).toBeTruthy();
      expect(q.weight).toBeGreaterThan(0);
    });
  });

  it("covers email authentication and a network firewall control", () => {
    const text = questions.map((q) => `${q.text} ${q.helpText ?? ""}`).join(" ").toLowerCase();
    expect(text).toContain("dmarc");
    expect(text).toContain("firewall");
  });

  it("covers the backlog topics: mobile devices, remote access, suppliers and data disposal", () => {
    const text = questions.map((q) => `${q.text} ${q.helpText ?? ""}`).join(" ").toLowerCase();
    expect(text).toContain("wipe"); // mobile device management (remote wipe)
    expect(text).toContain("vpn"); // secure remote access
    expect(text).toMatch(/supplier|provider|third/); // supplier assurance
    expect(text).toMatch(/dispose|disposal|getting rid|wipe/); // data disposal
  });

  it("uses a three-level Yes/Partly/No scale for maturity, giving 'partly' half credit", () => {
    expect(businessAnswerScale.map((o) => o.value)).toEqual(["yes", "partly", "no"]);
    const partly = businessAnswerScale.find((o) => o.value === "partly")!;
    expect(partly.credit).toBe(0.5);
  });

  it("keeps exposure questions on a Yes/No/Not-sure scale (no 'partly')", () => {
    const exposure = questions.filter((q) => q.kind === "exposure");
    exposure.forEach((q) => expect(q.scale).toBe(exposureAnswerScale));
    expect(exposureAnswerScale.map((o) => o.value)).toEqual(["yes", "no", "unsure"]);
  });

  it("no longer references the disestablished 'CERT NZ' brand without NCSC", () => {
    questions.forEach((q) => {
      const blob = `${q.text} ${q.helpText ?? ""} ${q.recommendation ?? ""}`;
      if (blob.includes("CERT NZ")) expect(blob).toContain("NCSC");
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

  it("offers an N/A option on the conditional website question", () => {
    const web = questions.find((q) => q.id === "upd_website")!;
    expect(web.scale?.some((o) => o.value === "na")).toBe(true);
  });

  it("frames behaviour questions as actions, not mere awareness", () => {
    // reduce self-report bias: no maturity question should ask only "are you aware…"
    const awarenessOnly = questions.filter(
      (q) => q.kind === "maturity" && /^(are you aware|would you know that you can)/i.test(q.text)
    );
    expect(awarenessOnly).toHaveLength(0);
  });

  it("every question explains why it matters (helpText)", () => {
    questions.forEach((q) => {
      expect(Boolean(q.helpText && q.helpText.trim().length)).toBe(true);
    });
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
