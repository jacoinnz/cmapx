import { scoreAssessment, summariseStandards } from "./scoring";
import {
  IT_STANDARDS,
  itAnswerScale,
  itCategories,
  itQuestions,
} from "./itQuestions";
import { AnswerMap } from "./types";

const creditByValue = Object.fromEntries(itAnswerScale.map((o) => [o.value, o.credit]));
const opts = { creditByValue, computeInsurance: false };

function answerAll(value: string): AnswerMap {
  const a: AnswerMap = {};
  itQuestions.forEach((q) => (a[q.id] = value));
  return a;
}

describe("IT assessment scoring (4-level maturity)", () => {
  it("scores 'Fully' everywhere as the top level and no next steps", () => {
    const r = scoreAssessment(answerAll("full"), itQuestions, itCategories, opts);
    expect(r.maturity.level).toBe(5);
    expect(r.maturity.levelLabel).toBe("Strong");
    expect(r.nextSteps).toHaveLength(0);
  });

  it("scores 'Not implemented' everywhere as the lowest level with remediation steps", () => {
    const r = scoreAssessment(answerAll("none"), itQuestions, itCategories, opts);
    expect(r.maturity.level).toBe(1);
    expect(r.maturity.levelLabel).toBe("Exposed");
    expect(r.nextSteps.length).toBeGreaterThan(0);
  });

  it("treats 'Largely' as partial credit (between the extremes)", () => {
    const r = scoreAssessment(answerAll("largely"), itQuestions, itCategories, opts);
    // 0.67 credit => ~67% => Managed (level 4)
    expect(r.maturity.overallPct).toBeGreaterThanOrEqual(60);
    expect(r.maturity.overallPct).toBeLessThan(80);
    expect(r.maturity.level).toBe(4);
  });

  it("never produces an insurance recommendation for the IT path", () => {
    const r = scoreAssessment(answerAll("largely"), itQuestions, itCategories, opts);
    expect(r.insurance).toBeNull();
  });

  it("summarises coverage for every standard", () => {
    const summary = summariseStandards(
      answerAll("full"),
      itQuestions,
      IT_STANDARDS,
      creditByValue
    );
    expect(summary).toHaveLength(IT_STANDARDS.length);
    summary.forEach((s) => {
      expect(s.questionCount).toBeGreaterThan(0);
      expect(s.scorePct).toBe(100);
    });
  });
});
