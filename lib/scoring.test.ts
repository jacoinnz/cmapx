import { scoreAssessment, buildResultsSummary } from "./scoring";
import { Category, Question, AnswerMap } from "./types";

const categories: Category[] = [
  {
    id: "access",
    ownerLabel: "Who can get in",
    description: "",
    threat: "Attackers who guess a password could get straight into your accounts.",
  },
  {
    id: "backups",
    ownerLabel: "Your safety net",
    description: "",
    threat: "A ransomware attack or mistake could wipe your data with no way back.",
  },
];

const questions: Question[] = [
  // access (maturity)
  { id: "acc1", text: "", weight: 1, kind: "maturity", categoryId: "access", recommendation: "Turn on two-step login for important accounts." },
  { id: "acc2", text: "", weight: 1, kind: "maturity", categoryId: "access", recommendation: "Use a password manager." },
  // backups (maturity)
  { id: "bak1", text: "", weight: 1, kind: "maturity", categoryId: "backups", recommendation: "Set up automatic backups." },
  { id: "bak2", text: "", weight: 1, kind: "maturity", categoryId: "backups", recommendation: "Test restoring a backup." },
  // exposure
  { id: "exp_data", text: "", weight: 2, kind: "exposure", categoryId: "access", exposureReason: "You hold customer personal information, so the Privacy Act 2020 may require you to report a breach." },
  { id: "exp_online", text: "", weight: 1, kind: "exposure", categoryId: "access", exposureReason: "You rely on online systems for income, so downtime would be costly." },
];

describe("scoreAssessment — maturity", () => {
  it("scores a strong category as a strength and an empty one as a weakness", () => {
    const answers: AnswerMap = {
      acc1: "yes", acc2: "yes",
      bak1: "no", bak2: "unsure",
      exp_data: "yes", exp_online: "yes",
    };
    const r = scoreAssessment(answers, questions, categories);

    const access = r.maturity.categoryScores.find((c) => c.categoryId === "access")!;
    const backups = r.maturity.categoryScores.find((c) => c.categoryId === "backups")!;

    expect(access.scorePct).toBe(100);
    expect(access.level).toBe("strength");
    expect(backups.scorePct).toBe(0);
    expect(backups.level).toBe("weakness");
  });

  it("treats 'partly' as half credit in the overall percentage", () => {
    const answers: AnswerMap = {
      acc1: "partly", acc2: "partly", bak1: "partly", bak2: "partly",
      exp_data: "no", exp_online: "no",
    };
    const r = scoreAssessment(answers, questions, categories);
    // 4 maturity questions each at half credit = 50%
    expect(r.maturity.overallPct).toBe(50);
  });

  it("counts every non-strength area as 'to improve' even when none is a weakness", () => {
    // all 'partly' => every category sits at 50% (developing): no strengths, no weaknesses
    const answers: AnswerMap = {
      acc1: "partly", acc2: "partly", bak1: "partly", bak2: "partly",
      exp_data: "no", exp_online: "no",
    };
    const s = buildResultsSummary(scoreAssessment(answers, questions, categories));
    expect(s.strengthCount).toBe(0);
    expect(s.weaknessCount).toBe(0);
    // both areas are still "to improve" — not a contradictory 0 alongside live actions
    expect(s.improveCount).toBe(2);
  });

  it("treats 'unsure' as a gap (no credit) in the overall percentage", () => {
    const answers: AnswerMap = {
      acc1: "yes", acc2: "yes", bak1: "no", bak2: "unsure",
      exp_data: "no", exp_online: "no",
    };
    const r = scoreAssessment(answers, questions, categories);
    // 2 of 4 maturity credits = 50%
    expect(r.maturity.overallPct).toBe(50);
    expect(r.maturity.level).toBe(3);
    expect(r.maturity.levelLabel).toBe("Developing");
  });

  it("maps overall percentage to the 1–5 level bands", () => {
    const allNo: AnswerMap = { acc1: "no", acc2: "no", bak1: "no", bak2: "no", exp_data: "no", exp_online: "no" };
    expect(scoreAssessment(allNo, questions, categories).maturity.level).toBe(1);
    expect(scoreAssessment(allNo, questions, categories).maturity.levelLabel).toBe("Exposed");

    const allYes: AnswerMap = { acc1: "yes", acc2: "yes", bak1: "yes", bak2: "yes", exp_data: "no", exp_online: "no" };
    expect(scoreAssessment(allYes, questions, categories).maturity.level).toBe(5);
    expect(scoreAssessment(allYes, questions, categories).maturity.levelLabel).toBe("Strong");
  });
});

describe("scoreAssessment — insurance exposure", () => {
  it("rates high exposure as a strong case and surfaces the Privacy Act reason", () => {
    const answers: AnswerMap = {
      acc1: "yes", acc2: "yes", bak1: "yes", bak2: "yes",
      exp_data: "yes", exp_online: "yes",
    };
    const r = scoreAssessment(answers, questions, categories);
    expect(r.insurance.rating).toBe("strong");
    expect(r.insurance.reasons.some((x) => x.includes("Privacy Act 2020"))).toBe(true);
  });

  it("rates no exposure as lower priority", () => {
    const answers: AnswerMap = {
      acc1: "yes", acc2: "yes", bak1: "yes", bak2: "yes",
      exp_data: "no", exp_online: "no",
    };
    const r = scoreAssessment(answers, questions, categories);
    expect(r.insurance.rating).toBe("lower");
    expect(r.insurance.reasons.length).toBe(0);
  });

  it("escalates a moderate exposure to 'strong' when maturity is low", () => {
    // low maturity (all no), moderate exposure (data unsure -> half of weight 2)
    const answers: AnswerMap = {
      acc1: "no", acc2: "no", bak1: "no", bak2: "no",
      exp_data: "unsure", exp_online: "no",
    };
    const r = scoreAssessment(answers, questions, categories);
    expect(r.maturity.level).toBeLessThanOrEqual(2);
    expect(r.insurance.rating).toBe("strong");
  });
});

describe("buildResultsSummary", () => {
  it("summarises level, counts and the strongest/weakest areas", () => {
    const answers: AnswerMap = {
      acc1: "yes", acc2: "yes",
      bak1: "no", bak2: "unsure",
      exp_data: "yes", exp_online: "yes",
    };
    const result = scoreAssessment(answers, questions, categories);
    const s = buildResultsSummary(result);

    expect(s.levelLabel).toBe(result.maturity.levelLabel);
    expect(s.strengthCount).toBe(1);
    expect(s.weaknessCount).toBe(1);
    // "to improve" = every area that isn't yet a strength (here: backups only)
    expect(s.improveCount).toBe(1);
    expect(s.actionCount).toBe(result.nextSteps.length);
    expect(s.strongest).toEqual({ label: "Who can get in", pct: 100 });
    expect(s.weakest).toEqual({ label: "Your safety net", pct: 0 });
    expect(s.lowestStandard).toBeUndefined();
  });
});

describe("scoreAssessment — SWOT and next steps", () => {
  it("builds SWOT quadrants and prioritised next steps from the gaps", () => {
    const answers: AnswerMap = {
      acc1: "yes", acc2: "yes",
      bak1: "no", bak2: "unsure",
      exp_data: "yes", exp_online: "yes",
    };
    const r = scoreAssessment(answers, questions, categories);

    expect(r.swot.strengths).toContain("Who can get in");
    expect(r.swot.weaknesses).toContain("Your safety net");
    // threat for the weak backups category appears
    expect(r.swot.threats.some((t) => t.includes("ransomware"))).toBe(true);
    // Privacy Act threat appears because customer-data exposure is present
    expect(r.swot.threats.some((t) => t.includes("Privacy Act 2020"))).toBe(true);

    // next steps come only from the gaps (the two backups questions)
    const texts = r.nextSteps.map((s) => s.text);
    expect(texts).toContain("Set up automatic backups.");
    expect(texts).toContain("Test restoring a backup.");
    expect(texts).not.toContain("Turn on two-step login for important accounts.");
    // opportunities mirror the top next steps
    expect(r.swot.opportunities).toContain("Set up automatic backups.");
  });
});
