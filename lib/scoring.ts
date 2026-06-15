import {
  Answer,
  AnswerMap,
  AnswerOption,
  AssessmentResult,
  Category,
  CategoryId,
  CategoryLevel,
  CategoryScore,
  InsuranceRating,
  NextStep,
  Question,
  StandardsSummary,
} from "./types";

// Sentinel answer for conditional controls that don't apply (e.g. "we don't
// build software"). Excluded from all scoring — never counted as a gap.
export const NA_ANSWER = "na";
export const naOption: AnswerOption = { value: NA_ANSWER, label: "Doesn't apply", credit: 0 };

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

// Default scale: business path (Yes = full, Partly = half, everything else = a gap).
const DEFAULT_CREDIT: Record<string, number> = { yes: 1, partly: 0.5, no: 0, unsure: 0 };

const MAX_NEXT_STEPS = 12;

export interface ScoreOptions {
  /** Maps an answer value to maturity credit (0..1). Defaults to the business scale. */
  creditByValue?: Record<string, number>;
  /** Whether to evaluate insurance exposure. Defaults to true (business path). */
  computeInsurance?: boolean;
}

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

function creditOf(
  answer: Answer | undefined,
  creditByValue: Record<string, number>
): number {
  if (answer === undefined) return 0;
  return creditByValue[answer] ?? 0;
}

/**
 * Pure assessment scorer: answers in → result out. No UI, no I/O, no content imports.
 * Maturity credit per answer comes from `opts.creditByValue` (defaults to the business
 * scale where Yes = full and anything else is a gap).
 */
export function scoreAssessment(
  answers: AnswerMap,
  questions: Question[],
  categories: Category[],
  opts: ScoreOptions = {}
): AssessmentResult {
  const creditByValue = opts.creditByValue ?? DEFAULT_CREDIT;
  const computeInsurance = opts.computeInsurance ?? true;

  // "Doesn't apply" answers are dropped from every maturity calculation.
  const applies = (q: Question) => answers[q.id] !== NA_ANSWER;
  const maturityQs = questions.filter((q) => q.kind === "maturity" && applies(q));
  const exposureQs = questions.filter((q) => q.kind === "exposure");

  // ---- Per-category maturity ----
  const categoryScores: CategoryScore[] = categories.map((cat) => {
    const qs = maturityQs.filter((q) => q.categoryId === cat.id);
    const totalWeight = qs.reduce((s, q) => s + q.weight, 0);
    const credit = qs.reduce(
      (s, q) => s + q.weight * creditOf(answers[q.id], creditByValue),
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
    (s, q) => s + q.weight * creditOf(answers[q.id], creditByValue),
    0
  );
  const overallPct = totalWeight === 0 ? 0 : Math.round((totalCredit / totalWeight) * 100);
  const { level, label } = overallBand(overallPct);

  // ---- Insurance exposure (business path only) ----
  let insurance: AssessmentResult["insurance"] = null;
  let privacyExposure = false;
  if (computeInsurance && exposureQs.length > 0) {
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
    if (rating === "consider" && level <= 2) rating = "strong";

    const reasons = exposureQs
      .filter((q) => answers[q.id] === "yes" || answers[q.id] === "unsure")
      .map((q) => q.exposureReason)
      .filter((r): r is string => Boolean(r));

    privacyExposure = exposureQs.some(
      (q) =>
        (answers[q.id] === "yes" || answers[q.id] === "unsure") &&
        (q.exposureReason ?? "").includes("Privacy Act")
    );

    insurance = { rating, ratingLabel: RATING_LABELS[rating], reasons };
  }

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

  // ---- Next steps (worst categories first, capped) ----
  const scoreByCat = new Map<CategoryId, number>(
    categoryScores.map((c) => [c.categoryId, c.scorePct])
  );
  const nextSteps: NextStep[] = maturityQs
    .filter((q) => creditOf(answers[q.id], creditByValue) < 1 && q.recommendation)
    .map((q) => ({
      categoryId: q.categoryId,
      text: q.recommendation as string,
      priority: scoreByCat.get(q.categoryId) ?? 0,
    }))
    .sort((a, b) => a.priority - b.priority)
    .slice(0, MAX_NEXT_STEPS);

  const opportunities = nextSteps.slice(0, 5).map((s) => s.text);

  return {
    maturity: { overallPct, level, levelLabel: label, categoryScores },
    insurance,
    swot: { strengths, weaknesses, opportunities, threats },
    nextSteps,
  };
}

/** At-a-glance figures for the results summary card. */
export interface ResultsSummary {
  level: number;
  levelLabel: string;
  overallPct: number;
  strengthCount: number;
  weaknessCount: number;
  /** Areas not yet at "strength" level (developing + weakness) — what the user can still improve. */
  improveCount: number;
  actionCount: number;
  strongest?: { label: string; pct: number };
  weakest?: { label: string; pct: number };
  /** Lowest-scoring standard (IT path only). */
  lowestStandard?: { standard: string; pct: number };
}

/** Derive the headline summary from a scored result (pure; safe on empty input). */
export function buildResultsSummary(
  result: AssessmentResult,
  standards?: StandardsSummary[]
): ResultsSummary {
  const cats = result.maturity.categoryScores;
  let strongest: ResultsSummary["strongest"];
  let weakest: ResultsSummary["weakest"];
  if (cats.length) {
    const sorted = [...cats].sort((a, b) => b.scorePct - a.scorePct);
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];
    strongest = { label: top.ownerLabel, pct: top.scorePct };
    weakest = { label: bottom.ownerLabel, pct: bottom.scorePct };
  }

  let lowestStandard: ResultsSummary["lowestStandard"];
  if (standards && standards.length) {
    const lowest = [...standards].sort((a, b) => a.scorePct - b.scorePct)[0];
    lowestStandard = { standard: lowest.standard, pct: lowest.scorePct };
  }

  return {
    level: result.maturity.level,
    levelLabel: result.maturity.levelLabel,
    overallPct: result.maturity.overallPct,
    strengthCount: result.swot.strengths.length,
    weaknessCount: result.swot.weaknesses.length,
    improveCount: cats.filter((c) => c.level !== "strength").length,
    actionCount: result.nextSteps.length,
    strongest,
    weakest,
    lowestStandard,
  };
}

/**
 * Per-standard coverage for the IT path's standards matrix: the weighted maturity
 * percentage across the maturity questions tagged with each standard.
 */
export function summariseStandards(
  answers: AnswerMap,
  questions: Question[],
  standards: string[],
  creditByValue: Record<string, number> = DEFAULT_CREDIT
): StandardsSummary[] {
  return standards.map((std) => {
    const qs = questions.filter(
      (q) =>
        q.kind === "maturity" &&
        (q.standards ?? []).includes(std) &&
        answers[q.id] !== NA_ANSWER
    );
    const weight = qs.reduce((s, q) => s + q.weight, 0);
    const credit = qs.reduce(
      (s, q) => s + q.weight * creditOf(answers[q.id], creditByValue),
      0
    );
    return {
      standard: std,
      scorePct: weight === 0 ? 0 : Math.round((credit / weight) * 100),
      questionCount: qs.length,
    };
  });
}
