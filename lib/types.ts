// Domain contracts for the CMAP assessment. Pure data — no UI, no I/O.

export type Answer = "yes" | "no" | "unsure";

export type QuestionKind = "maturity" | "exposure";

export type CategoryId =
  | "access"
  | "updates"
  | "backups"
  | "detection"
  | "people"
  | "response";

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
  /** Maturity questions: plain next step shown when the answer is not "yes". */
  recommendation?: string;
  /** Exposure questions: plain reason shown when the answer is "yes"/"unsure". */
  exposureReason?: string;
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

export interface AssessmentResult {
  maturity: MaturityResult;
  insurance: InsuranceResult;
  swot: SwotResult;
  nextSteps: NextStep[];
}
