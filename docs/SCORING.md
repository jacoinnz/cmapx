# Scoring

All scoring lives in `lib/scoring.ts` as **pure functions**: answers in → result out. No UI, no
I/O, no content imports. This is the unit covered hardest by tests (`scoring.test.ts`,
`itScoring.test.ts`).

```ts
scoreAssessment(answers, questions, categories, opts?) → AssessmentResult
summariseStandards(answers, questions, standards, creditByValue?) → StandardsSummary[]
```

## Answer credit

Each answer value maps to a maturity **credit** in `[0, 1]`, supplied by the assessment's answer
scale and passed to the engine as `opts.creditByValue`. Defaults to the business scale.

| Path | Values → credit |
|------|-----------------|
| Business | `yes → 1`, `no → 0`, `unsure → 0` (unsure is treated as a gap) |
| IT | `none → 0`, `partial → 0.34`, `largely → 0.67`, `full → 1` |

A question's contribution is `weight × credit(answer)`. Unanswered → 0.

## Per-category maturity

For each category: `scorePct = round(Σ(weight·credit) / Σ(weight) × 100)`, then a level:

| scorePct | Category level |
|----------|----------------|
| ≥ 67 | `strength` |
| 34–66 | `developing` |
| < 34 | `weakness` |

## Overall maturity (1–5)

Weighted across **all** maturity questions, banded:

| overallPct | Level | Label |
|------------|-------|-------|
| < 20 | 1 | Exposed |
| 20–39 | 2 | Basic |
| 40–59 | 3 | Developing |
| 60–79 | 4 | Managed |
| ≥ 80 | 5 | Strong |

## SWOT

- **Strengths** — category labels scored as `strength`.
- **Weaknesses** — category labels scored as `weakness`.
- **Opportunities** — the top (≤5) prioritised next-step texts.
- **Threats** — each `weakness`/`developing` category's plain `threat` string, plus the Privacy Act
  2020 threat when customer-data exposure is present (business path).

## Next steps

Every maturity question whose answer earned **less than full credit** and has a `recommendation`
becomes a step, tagged with its category's `scorePct` as priority, sorted worst-first, and capped
at 12. The first five also become the SWOT "Opportunities".

## Insurance (business path only)

Computed only when `opts.computeInsurance !== false` **and** the question set has `exposure`
questions; otherwise `result.insurance` is `null`.

- Exposure credit: `yes → weight`, `unsure → weight/2`, `no → 0`; `exposurePct` is the weighted %.
- Base rating: `≥ 50 → strong`, `≥ 25 → consider`, else `lower`.
- **Escalation:** a `consider` becomes `strong` when overall maturity level ≤ 2 (high exposure +
  low maturity = strongest case).
- `reasons` = the `exposureReason` of every exposure question answered `yes`/`unsure`. The Privacy
  Act 2020 is named whenever the customer-data exposure question applies.

## Standards coverage (IT path only)

`summariseStandards` returns, per standard, the weighted maturity % across the maturity questions
tagged with that standard (via `Question.standards`), plus the question count. Rendered as the
"How you map to NZ standards" matrix and included in the PDF.

## Worked example

IT path, all answers `largely` (credit 0.67): every category ≈ 67% → `strength`; overall ≈ 67% →
**level 4, Managed**; no full-credit answers so every question yields a next step (capped at 12);
`insurance` is `null`; each standard's coverage ≈ 67%.
