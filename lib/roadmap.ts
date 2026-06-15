import { NextStep } from "./types";

export type Effort = "quick" | "project";

export interface RoadmapItem {
  text: string;
  categoryId: string;
  effort: Effort;
}

export interface Roadmap {
  /** Low-effort, high-leverage actions to do first. */
  quickWins: RoadmapItem[];
  /** Bigger pieces that need planning, people or budget. */
  projects: RoadmapItem[];
}

// Recommendations that start with these verbs are usually a setting/toggle.
const QUICK_HINTS =
  /\b(turn on|switch on|enable|set up|set backups|use a|make sure|note how|update|keep)\b/i;
// These usually need planning, process or people.
const PROJECT_HINTS =
  /\b(write|plan|establish|introduce|implement|deploy|segment|exercise|adopt|build|stand up|operationalise|assign|maintain|enforce|run )\b/i;

/** Classify a recommendation as a quick win or a bigger project. */
export function classifyEffort(text: string): Effort {
  if (PROJECT_HINTS.test(text)) return "project";
  if (QUICK_HINTS.test(text)) return "quick";
  return "project"; // default to the cautious side
}

/**
 * Turn the prioritised next-steps (worst categories first) into a sequenced
 * roadmap: quick wins first, then bigger projects — each keeping its original
 * priority order.
 */
export function buildRoadmap(nextSteps: NextStep[]): Roadmap {
  const items: RoadmapItem[] = nextSteps.map((s) => ({
    text: s.text,
    categoryId: s.categoryId,
    effort: classifyEffort(s.text),
  }));
  return {
    quickWins: items.filter((i) => i.effort === "quick"),
    projects: items.filter((i) => i.effort === "project"),
  };
}
