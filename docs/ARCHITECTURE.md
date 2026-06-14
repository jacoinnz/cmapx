# Architecture

## Overview

A single Next.js app exported as a fully static site. Three routes:

- `/` — landing chooser (server component, just two `<Link>` cards).
- `/business` — business-owner assessment.
- `/it` — IT/technical assessment.

Both assessment routes are thin pages that hand a **config object** to one shared
`Assessment` component. The config supplies the content (categories + questions), the answer scale,
and a few flags. Everything else — wizard flow, scoring, results, radar, SWOT, PDF — is shared.

```
/business  ─┐                              ┌─ Wizard (one section at a time)
            ├─ <Assessment config={...}> ──┤
/it        ─┘     │                        └─ Results ─ radar / SWOT / standards / insurance / PDF
                  │
                  └─ scoreAssessment(answers, questions, categories, opts) → AssessmentResult
                     summariseStandards(...) → StandardsSummary[]  (IT only)
```

## Privacy model (enforced, not promised)

- `next.config.mjs` sets `output: "export"` → the build emits static HTML/JS to `out/`. There is
  **no server runtime**, so there is nowhere for answers to be sent or stored.
- Answers live in a single `useState<AnswerMap>` inside `Assessment.tsx`. They are never written to
  `localStorage`, cookies, or the network.
- The PDF is generated in the browser via `@react-pdf/renderer` (`pdf(...).toBlob()`), downloaded
  with an object URL. Nothing leaves the machine.
- `images.unoptimized: true` avoids the Next image optimiser (a server feature), keeping the export
  purely static.

## Data flow

1. `Assessment` holds `answers` (`{ [questionId]: answerValue }`) and a `done` flag.
2. `Wizard` renders the current category's questions with the configured `answerScale`; the user
   cannot advance past a section until every question in it is answered (no silent skips).
3. On completion, `Assessment` recomputes (memoised):
   - `scoreAssessment(answers, questions, categories, { creditByValue, computeInsurance })`
   - `summariseStandards(...)` when the config provides a `standards` list (IT path).
4. `Results` renders the maturity headline, radar, SWOT, optional standards matrix, optional
   insurance panel, and the PDF export button.

## Reuse design (why both paths share code)

The two assessments differ only in **content** and **two parameters**:

| Difference | Mechanism |
|------------|-----------|
| Question set & domains | `categories` + `questions` in the config |
| Answer scale (3-way vs 4-level) | `answerScale: AnswerOption[]` (each option carries a 0–1 `credit`) |
| Insurance recommendation | `computeInsurance: boolean` |
| Standards coverage matrix | `standards?: string[]` |

This keeps the scoring engine and all UI components generic. The business path uses the defaults
(`creditByValue` derived from Yes=1, insurance on); the IT path overrides them. Adding a third
assessment later means adding content + a config — no engine or component changes.

## Key modules

- **`lib/types.ts`** — domain contracts. `Answer`/`CategoryId` are strings so each assessment can
  define its own scale values and domain ids. `AssessmentResult.insurance` is nullable.
- **`lib/scoring.ts`** — pure functions only (no imports of content, no I/O). The most heavily
  tested unit. See [SCORING.md](SCORING.md).
- **`components/Assessment.tsx`** — the only stateful piece; everything below it is presentational.
- **`components/MaturityRadar.tsx` / `Results.tsx`** — Recharts is loaded via `next/dynamic` with
  `ssr: false` because it touches the DOM; the PDF libs are dynamically imported inside the export
  click handler so they stay out of the initial bundle and never run during the static build.

## Rendering notes

- `/business` and `/it` are `"use client"` pages (they own interactive state) but are still
  statically prerendered — the static HTML is the initial shell, React hydrates on load.
- The landing `/` is a server component (no client JS needed beyond navigation).
