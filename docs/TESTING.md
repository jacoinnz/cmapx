# Testing

Three layers, all run in CI; the deploy is gated on the first two.

## Unit (Jest + Testing Library) — `npm test`

Fast, runs on every push. Lives next to the code as `*.test.ts(x)`.

| Suite | Covers |
|-------|--------|
| `lib/scoring.test.ts` | Maturity bands, "unsure" = gap, insurance traffic-light + escalation, Privacy Act, SWOT, next steps |
| `lib/itScoring.test.ts` | 4-level credit (full=L5, none=L1, largely≈L4), insurance null for IT, standards summary |
| `lib/questions.test.ts` | Business content integrity + every question has `helpText`; real-content integration |
| `lib/itQuestions.test.ts` | 8 domains, ~40 questions fully specified, all 5 standards represented, unique ids |
| `components/Wizard.test.tsx` | Renders a section, Next disabled until answered, records answers |
| `components/ReportPdf.test.tsx` | Renders a real PDF buffer (Node env) without throwing |

The scoring engine is pure, so it's tested directly with fixtures — no DOM, no mocks.

## End-to-end (Playwright) — `npm run test:e2e`

Drives the **real built static export** (`out/`, served by `serve`) in headless Chromium.
Requires a build first (`npm run build`). `e2e/smoke.spec.ts` has three tests:

1. **Landing** — both path cards are present.
2. **Business path** — click the card → walk all 6 sections answering "Yes" → assert maturity
   "Strong", radar, insurance "Strong case", Privacy Act, disclaimer → download the PDF.
3. **IT path** — click the card → walk all 8 sections answering "Fully" → assert maturity, radar,
   the standards-coverage matrix, no insurance panel → download the PDF.

The `completeWizard` helper loops sections generically, so it works for either path regardless of
section count.

## CI gate — `.github/workflows/deploy.yml`

```
push/PR to main
  ├─ test   (npm ci → npm test)
  ├─ e2e    (npm ci → build → install Chromium → test:e2e, uploads HTML report)
  └─ deploy (needs: [test, e2e])  →  Vercel (production on main, preview on PRs)
```

Nothing deploys unless **both** the unit and browser layers pass. The Playwright HTML report is
uploaded as a build artifact for debugging failures.

## Local pre-push check

```bash
npm test && npm run build && npm run test:e2e
```

If all three pass locally, CI will too (same commands, same Node 20 toolchain).
