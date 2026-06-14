import {
  AnswerMap,
  AssessmentResult,
  Category,
  CategoryId,
  CategoryLevel,
  CategoryScore,
  InsuranceRating,
  NextStep,
  Question,
} from "./types";

// Level 1..5 labels (index 0..4).
const LEVEL_LABELS = ["Exposed", "Basic", "Developing", "Managed", "Strong"];

const RATING_LABELS: Record<InsuranceRating, string> = {
  strong: "Strong case for cyber liability insurance",
  consider: "Worth considering",
  lower: "Lower priority",
};

const PRIVACY_ACT_THREAT =
  "If customer information is stolen, the Privacy Act 2020 can require you to notify the " +
  "Privacy Commissioner and affected people, with possible penalties.";

function categoryLevel(pct: number): CategoryLevel {
  if (pct >= 67) return "strength";
  if (pct < 34) return "weakness";
  return "developing";
}

function overallBand(pct: number): { level: number; label: string } {
  let idx: number;
  if (pct < 20) idx = 0;
  else if (pct < 40) idx = 1;
  else if (pct < 60) idx = 2;
  else if (pct < 80) idx = 3;
  else idx = 4;
  return { level: idx + 1, label: LEVEL_LABELS[idx] };
}

/**
 * Pure assessment scorer: answers in → result out. No UI, no I/O, no content imports.
 * "unsure" counts as a maturity gap (no credit) and as cautious (half) exposure.
 */
export function scoreAssessment(
  answers: AnswerMap,
  questions: Question[],
  categories: Category[]
): AssessmentResult {
  const maturityQs = questions.filter((q) => q.kind === "maturity");
  const exposureQs = questions.filter((q) => q.kind === "exposure");

  // ---- Per-category maturity ----
  const categoryScores: CategoryScore[] = categories.map((cat) => {
    const qs = maturityQs.filter((q) => q.categoryId === cat.id);
    const totalWeight = qs.reduce((s, q) => s + q.weight, 0);
    const credit = qs.reduce(
      (s, q) => s + (answers[q.id] === "yes" ? q.weight : 0),
      0
    );
    const scorePct = totalWeight === 0 ? 0 : Math.round((credit / totalWeight) * 100);
    return {
      categoryId: cat.id,
      ownerLabel: cat.ownerLabel,
      scorePct,
      level: categoryLevel(scorePct),
    };
  });

  // ---- Overall maturity ----
  const totalWeight = maturityQs.reduce((s, q) => s + q.weight, 0);
  const totalCredit = maturityQs.reduce(
    (s, q) => s + (answers[q.id] === "yes" ? q.weight : 0),
    0
  );
  const overallPct = totalWeight === 0 ? 0 : Math.round((totalCredit / totalWeight) * 100);
  const { level, label } = overallBand(overallPct);

  // ---- Insurance exposure (separate from maturity) ----
  const exposureWeight = exposureQs.reduce((s, q) => s + q.weight, 0);
  const exposureCredit = exposureQs.reduce((s, q) => {
    const a = answers[q.id];
    if (a === "yes") return s + q.weight;
    if (a === "unsure") return s + q.weight * 0.5;
    return s;
  }, 0);
  const exposurePct = exposureWeight === 0 ? 0 : (exposureCredit / exposureWeight) * 100;

  let rating: InsuranceRating =
    exposurePct >= 50 ? "strong" : exposurePct >= 25 ? "consider" : "lower";
  // High exposure + low maturity = strongest case.
  if (rating === "consider" && level <= 2) rating = "strong";

  const reasons = exposureQs
    .filter((q) => answers[q.id] === "yes" || answers[q.id] === "unsure")
    .map((q) => q.exposureReason)
    .filter((r): r is string => Boolean(r));

  const privacyExposure = exposureQs.some(
    (q) =>
      (answers[q.id] === "yes" || answers[q.id] === "unsure") &&
      (q.exposureReason ?? "").includes("Privacy Act")
  );

  // ---- SWOT ----
  const strengths = categoryScores
    .filter((c) => c.level === "strength")
    .map((c) => c.ownerLabel);
  const weaknesses = categoryScores
    .filter((c) => c.level === "weakness")
    .map((c) => c.ownerLabel);

  const threatSet = new Set<string>();
  categories.forEach((cat) => {
    const cs = categoryScores.find((c) => c.categoryId === cat.id);
    if (cs && (cs.level === "weakness" || cs.level === "developing")) {
      threatSet.add(cat.threat);
    }
  });
  if (privacyExposure) threatSet.add(PRIVACY_ACT_THREAT);
  const threats = Array.from(threatSet);

  // ---- Next steps (worst categories first) ----
  const scoreByCat = new Map<CategoryId, number>(
    categoryScores.map((c) => [c.categoryId, c.scorePct])
  );
  const nextSteps: NextStep[] = maturityQs
    .filter((q) => answers[q.id] !== "yes" && q.recommendation)
    .map((q) => ({
      categoryId: q.categoryId,
      text: q.recommendation as string,
      priority: scoreByCat.get(q.categoryId) ?? 0,
    }))
    .sort((a, b) => a.priority - b.priority);

  const opportunities = nextSteps.slice(0, 5).map((s) => s.text);

  return {
    maturity: { overallPct, level, levelLabel: label, categoryScores },
    insurance: { rating, ratingLabel: RATING_LABELS[rating], reasons },
    swot: { strengths, weaknesses, opportunities, threats },
    nextSteps,
  };
}
