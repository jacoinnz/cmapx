// Domain contracts for the CMAP assessment. Pure data — no UI, no I/O.

// An answer is a scale value (e.g. "yes" or "largely"); scales are data-driven.
export type Answer = string;

export type QuestionKind = "maturity" | "exposure";

// Category ids are free strings so different assessments can define their own domains.
export type CategoryId = string;

// One selectable answer on a scale, with the maturity credit it earns (0..1).
export interface AnswerOption {
  value: string;
  label: string;
  credit: number;
}

export interface Category {
  id: CategoryId;
  /** Plain, owner-facing name — never security jargon. */
  ownerLabel: string;
  description: string;
  /** Plain consequence used in the SWOT "Threats" quadrant when this is a gap. */
  threat: string;
}

export interface Question {
  id: string;
  /** Plain-language question answerable with zero security knowledge. */
  text: string;
  /** Optional one-line "why this matters". */
  helpText?: string;
  /** Contribution to the score. */
  weight: number;
  kind: QuestionKind;
  categoryId: CategoryId;
  /** Maturity questions: plain next step shown when the answer is not full. */
  recommendation?: string;
  /** Exposure questions: plain reason shown when the answer is "yes"/"unsure". */
  exposureReason?: string;
  /** Standards/frameworks this question maps to (e.g. "NZISM", "Essential Eight"). */
  standards?: string[];
  /** Optional per-question answer scale. Falls back to the assessment's default scale. */
  scale?: AnswerOption[];
}

export type AnswerMap = Record<string, Answer>;

// ---- Results ----

export type CategoryLevel = "strength" | "developing" | "weakness";

export interface CategoryScore {
  categoryId: CategoryId;
  ownerLabel: string;
  /** 0–100. */
  scorePct: number;
  level: CategoryLevel;
}

export interface MaturityResult {
  /** 0–100 weighted across all maturity questions. */
  overallPct: number;
  /** 1–5. */
  level: number;
  /** Exposed | Basic | Developing | Managed | Strong. */
  levelLabel: string;
  categoryScores: CategoryScore[];
}

export type InsuranceRating = "strong" | "consider" | "lower";

export interface InsuranceResult {
  rating: InsuranceRating;
  /** Owner-facing heading for the rating. */
  ratingLabel: string;
  /** Plain reasons behind the rating, always shown. */
  reasons: string[];
}

export interface NextStep {
  categoryId: CategoryId;
  text: string;
  /** Lower number = higher priority (worst gaps first). */
  priority: number;
}

export interface SwotResult {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

/** Per-standard coverage, for the IT assessment's standards matrix. */
export interface StandardsSummary {
  standard: string;
  scorePct: number;
  questionCount: number;
}

export interface AssessmentResult {
  maturity: MaturityResult;
  /** Null when the assessment doesn't evaluate insurance (e.g. the IT path). */
  insurance: InsuranceResult | null;
  swot: SwotResult;
  nextSteps: NextStep[];
}
