# Cybersecurity Maturity Health Check (NZ)

[![Deploy to Vercel](https://github.com/jacoinnz/cmapx/actions/workflows/deploy.yml/badge.svg)](https://github.com/jacoinnz/cmapx/actions/workflows/deploy.yml)

A free, **fully client-side** cybersecurity maturity health check for New Zealand organisations.
The landing page offers **two paths**:

| Path | For | Questions | Answer scale | Mapped to |
|------|-----|-----------|--------------|-----------|
| **Business owners** (`/business`) | Non-technical owners | ~30 plain-English | Yes / No / Not sure | NZ-credible controls, Privacy Act 2020 |
| **IT people** (`/it`) | Technical staff | ~40 across 8 control domains | Not implemented → Partially → Largely → Fully | NZISM, PSR, Essential Eight, ISO 27001, HISF |

Both paths produce: an overall **maturity level (1–5)**, a **radar chart**, a **SWOT snapshot**,
prioritised **next steps**, and a one-click **PDF export**. The business path adds a **cyber
liability insurance** indication; the IT path adds a **standards-coverage matrix**.

**Live:** https://cmap-theta.vercel.app

## Privacy by architecture

No backend, no database, no accounts, no analytics on answers. Responses live only in browser
memory and are never stored or transmitted. The PDF is generated in the browser. Closing the tab
erases everything. This is enforced by the build (`output: "export"` — a static site with no
server), not just by policy.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # Jest unit tests (scoring + content)
npm run build      # static export to ./out
npm run test:e2e   # Playwright browser smoke (needs a build first)
```

## Project structure

```
app/
  page.tsx              # landing chooser (two cards → /business, /it)
  business/page.tsx     # business assessment (config + content)
  it/page.tsx           # IT assessment (config + content)
  layout.tsx, globals.css
lib/
  types.ts              # shared domain contracts
  scoring.ts            # pure scoring engine (maturity, SWOT, insurance, standards)
  questions.ts          # business questions + answer scale
  itQuestions.ts        # IT questions, domains, 4-level scale, standards list
  *.test.ts             # unit tests
components/
  Assessment.tsx        # shared runner: holds state, wires Wizard ↔ Results
  Wizard.tsx            # one section at a time, configurable answer scale
  Results.tsx           # maturity, radar, SWOT, standards, insurance, export
  MaturityRadar.tsx     # Recharts radar (client-only)
  SwotGrid.tsx, InsurancePanel.tsx
  ExportButton.tsx, ReportPdf.tsx   # in-browser PDF
e2e/smoke.spec.ts       # Playwright: chooser + both full paths
.github/workflows/deploy.yml        # test → e2e → deploy (Vercel)
docs/                   # see below
```

## Documentation

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — how it's built, data flow, the privacy model, reuse design.
- **[docs/SCORING.md](docs/SCORING.md)** — the scoring rules (maturity bands, SWOT, insurance, standards).
- **[docs/CONTENT.md](docs/CONTENT.md)** — how to add or edit questions for either path.
- **[docs/TESTING.md](docs/TESTING.md)** — the test strategy and the CI gate.
- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** — the GitHub Actions → Vercel pipeline and secrets.
- **[docs/superpowers/specs/](docs/superpowers/specs/)** — the original design spec (historical).

## Tech stack

Next.js 14 (App Router, static export) · React 18 · TypeScript · Recharts (radar) ·
`@react-pdf/renderer` (PDF) · Jest + Testing Library (unit) · Playwright (e2e) · Vercel (hosting).

## Disclaimer

This is an informational tool only. It is not affiliated with any insurer and does not sell
insurance. For decisions about cover, speak to a licensed adviser.
