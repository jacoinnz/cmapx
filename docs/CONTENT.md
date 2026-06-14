# Editing the questions

All content is data-driven — no question text lives in components. Edit the content files and the
UI, scoring, SWOT, PDF and tests pick it up automatically.

- **Business path:** `lib/questions.ts` (`categories`, `questions`, `businessAnswerScale`)
- **IT path:** `lib/itQuestions.ts` (`itCategories`, `itQuestions`, `itAnswerScale`, `IT_STANDARDS`)

## The shapes

```ts
Category = {
  id: string;            // unique within this assessment
  ownerLabel: string;    // shown to the user (and on the radar / SWOT)
  description: string;   // one line under the section title
  threat: string;        // plain consequence used in SWOT "Threats" when this is a gap
}

Question = {
  id: string;            // unique across the set
  categoryId: string;    // must match a Category.id
  kind: "maturity" | "exposure";
  weight: number;        // contribution to the score (≥ 1)
  text: string;          // the question
  helpText?: string;     // the "Why does this matter?" explanation — REQUIRED in practice (tested)
  recommendation?: string;   // maturity: the next step shown when not fully answered
  exposureReason?: string;   // exposure: reason shown when yes/unsure (business only)
  standards?: string[];      // IT: which standards this maps to (drives the coverage matrix)
}

AnswerOption = { value: string; label: string; credit: number /* 0..1 */ }
```

## Rules enforced by tests

Both content suites (`questions.test.ts`, `itQuestions.test.ts`) will fail if you break these:

- **Every question has a non-empty `helpText`** ("Why does this matter?").
- Maturity questions have a `recommendation`; IT questions also have ≥1 `standards` entry.
- All `categoryId`s reference a defined category; all question `id`s are unique.
- Business set: 25–30 maturity questions; IT set: 38–45 questions across 8 domains.
- IT: every `standards` value is one of `IT_STANDARDS`, and all five standards appear somewhere.

So when you add a question, add `helpText` (+ `recommendation`, + `standards` for IT) or the build
goes red. That's intentional — it keeps the "zero-knowledge" and "standards-mapped" promises true.

## Add a question (business)

```ts
// lib/questions.ts → questions[]
{
  id: "acc_session",
  categoryId: "access",
  kind: "maturity",
  weight: 1,
  text: "Are staff automatically logged out of important systems after a period of inactivity?",
  helpText: "An unattended, logged-in device is an open door for anyone nearby.",
  recommendation: "Turn on automatic sign-out / screen lock on key systems.",
}
```

## Add a question (IT)

The `m(...)` helper in `itQuestions.ts` keeps entries terse:

```ts
// m(id, categoryId, standards, text, helpText, recommendation, weight?)
m("id_pam", "identity", ["NZISM", "ISO 27001"],
  "Are privileged sessions brokered and recorded through a PAM solution?",
  "Privileged access management limits and audits the most dangerous accounts.",
  "Introduce a PAM solution for privileged session brokering and recording."),
```

## Change a scale, threshold, or domain

- **Answer scale:** edit `businessAnswerScale` / `itAnswerScale`. Each option's `credit` feeds the
  maturity score directly; the engine needs no changes.
- **Maturity bands / category thresholds / next-step cap:** constants at the top of `lib/scoring.ts`.
- **Add an IT domain:** add a `Category` to `itCategories` and tag questions with its `id`. Update
  the count assertion in `itQuestions.test.ts` if you cross 45 questions.

## After editing

```bash
npm test           # content + scoring suites
npm run build      # type-check + static export
npm run test:e2e   # optional: full browser walk-through
```
