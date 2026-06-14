# CMAP — Cyber Maturity Assessment Platform (NZ)

**Status:** Approved design (2026-06-14)
**Deployment targets:** GitHub `github.com/jacoinnz/cmapx` → Vercel `mirutech/cmap`

---

## 1. Purpose

A free, single-page web tool that helps **any NZ business owner with zero
cybersecurity knowledge** understand their cybersecurity maturity — their
strengths and weaknesses — see practical next steps, and learn whether they
should consider **cyber liability insurance**.

It is an **informational tool only**. It does not sell insurance and has no
commercial relationship with the result. It informs the business about their
requirements.

**Hard privacy guarantee, enforced by architecture:** no backend, no accounts,
no database, no analytics capturing answers, no cookies storing responses.
Answers live only in browser memory (React state) and never leave the user's
machine. When the tab closes, everything is gone.

## 2. Target user

- Owner/operator of a NZ small-to-medium business.
- **Assume 0% cybersecurity knowledge.** Every question must be answerable by
  someone who has never heard the words "MFA", "patch", or "incident response".
- Questions are phrased about *how they run their business*, not about security
  controls. The security framework is invisible internal scaffolding.

## 3. Framework (internal only — never shown to the user)

Plain-language questions are authored from NZ-credible controls (CERT NZ / NCSC
critical-controls style) and grouped, for results and SWOT, into 6
owner-facing categories. The user never sees framework names or jargon.

**Phrasing standard (zero-knowledge):**

| ❌ Never show | ✅ What we ask |
|---|---|
| "Do you enforce MFA on external services?" | "When you or your staff log in to important accounts (like email or banking), do you have to enter a second code from your phone — not just a password?" |
| "Do you maintain an asset inventory?" | "Could you quickly write down every device and online service your business uses to operate?" |
| "Do you have a tested incident response plan?" | "If a customer called tomorrow saying your systems were hacked, would you know exactly who to call and what to do first?" |

## 4. Answer model

Every question is answered with **Yes / No / Not sure**.

- Simplest, least intimidating format.
- "Not sure" is meaningful — it signals a gap and scores accordingly.

## 5. Assessment scope

- **~25–30 questions** across **6 categories**, shown **one category at a
  time** with a progress bar (~7–10 minutes to complete).
- The 6 owner-facing categories (→ what they map to internally):
  1. **Who can get in** → access & passwords (MFA, password practices)
  2. **Keeping things up to date** → patching & updates
  3. **Your safety net** → backups & recovery
  4. **Spotting trouble** → email/phishing, antivirus, monitoring
  5. **Your people** → staff awareness & training
  6. **If something goes wrong** → incident response & who-to-call

## 6. Content model (data-driven)

Questions live in a typed data file, not hardcoded in components, so the set can
grow or be reworded without touching UI or scoring logic.

```
Category → { id, ownerLabel, description, questions[] }
Question → {
  id,
  text,            // plain-language question
  helpText?,       // optional one-line "why this matters"
  weight,          // contribution to score
  kind,            // 'maturity' | 'exposure'
  categoryId
}
```

- `maturity` questions feed the per-category maturity score.
- `exposure` questions feed the insurance recommendation (evaluated
  separately from maturity).

## 7. Scoring engine (pure, isolated, unit-tested)

A pure function: `answers in → result object out`. No UI, no I/O. This is the
unit tested hardest, and built first via TDD.

**Maturity:**
- Per maturity question: `Yes` = full credit, `Not sure` = none (treated as a
  gap), `No` = none.
- Per-category score = weighted ratio → labelled **Strength** (high) or
  **Weakness** (low).
- Overall = weighted roll-up of categories → maturity level **1–5**:
  *Exposed → Basic → Developing → Managed → Strong*.

**Insurance exposure (separate from maturity):**
Evaluated from a small set of exposure questions:
- Holds customer personal information (names, emails, payment/health data) —
  triggers **Privacy Act 2020** breach-notification consideration.
- Makes money online / would lose income from a day of downtime.
- Could not comfortably absorb ~$50k+ of unexpected recovery/legal/notification
  costs.
- Operates in a regulated or contractually-bound space (health, finance,
  government suppliers).

Result is a **traffic light**:
- **Strong case** (high exposure, especially with low maturity)
- **Worth considering** (moderate exposure)
- **Lower priority** (low exposure)

The reasons behind the rating are always shown. The **Privacy Act 2020** is
named explicitly where customer-data exposure exists, because breach
notification is a real NZ legal obligation.

## 8. Results & visuals

- **Maturity headline** — e.g. "Developing — Level 3 of 5".
- **Radar chart (Recharts)** — all 6 categories at once, showing the "shape" of
  their security.
- **SWOT 2×2:**
  - **Strengths** — categories scored well.
  - **Weaknesses** — categories scored poorly.
  - **Opportunities** — prioritised, plain-language next steps.
  - **Threats** — what the gaps expose them to (data theft, downtime, Privacy
    Act fines/notification obligations).
- **Prioritised next steps** — plain-language actions, worst gaps first.
- **Insurance recommendation** — traffic light + reasons + **disclaimer**:
  informational only, not financial/insurance advice, speak to a licensed
  broker.

## 9. Export (real client-side PDF)

- Prominent **"Download my report (PDF)"** as the primary action on the results
  screen.
- Generated **in-browser** via `@react-pdf/renderer` — nothing is sent to a
  server, consistent with the privacy guarantee.
- PDF contains: maturity headline, radar chart, SWOT 2×2, prioritised next
  steps, and the insurance recommendation with disclaimer.
- **Strictness (A + i):** results are visible on screen and export is the clear
  primary call-to-action, but not forcibly blocking — a browser cannot truly
  force a download. We make it the obvious, prominent next step.

## 10. Trust & privacy surface

- Visible **"We store nothing"** note explaining no data is saved or sent.
- No analytics on answers, no network calls carrying user data, no response
  cookies. Enforced by the architecture: answers never leave React state.

## 11. Architecture

```
Next.js static app (Vercel)
 └─ Wizard (6 categories, one at a time, progress bar)
      ↓ answers in React state only (never persisted)
 └─ Scoring engine (pure functions, unit-tested)
      ├─ Maturity per category + overall level (1–5)
      ├─ Strengths / Weaknesses derivation
      └─ Insurance exposure evaluation (traffic light)
 └─ Results view (Recharts radar + SWOT 2×2 + maturity dial + steps + insurance)
 └─ Export (@react-pdf/renderer → PDF download in-browser)
```

**Stack:** Next.js (static export), React, Recharts (radar),
`@react-pdf/renderer` (PDF). Chosen for first-party Vercel deploy and mature
libraries for the radar + PDF.

## 12. Error handling

Minimal surface (no network/data layer):
- Cannot reach results until the current category's questions are answered
  (no silent skips).
- If PDF generation fails: on-screen "try again", and the results remain visible
  so nothing is lost.

## 13. Testing

- **Unit (Jest)** — the scoring engine. Every maturity-level boundary, each
  insurance traffic-light path, Privacy-Act exposure logic. Built first via TDD
  (Red → Green → Refactor).
- **Component (React Testing Library)** — wizard navigation, can't-skip-required,
  results render correctly.
- **Smoke** — PDF generates without throwing for a complete answer set.

## 14. Out of scope (YAGNI)

No login, no save/resume, no database, no email sending, no admin panel, no
multi-language, no live insurance quoting, no storing or transmitting any user
data.
