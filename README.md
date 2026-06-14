# CMAP — Cyber Maturity Assessment Platform (NZ)

[![Deploy to Vercel](https://github.com/jacoinnz/cmapx/actions/workflows/deploy.yml/badge.svg)](https://github.com/jacoinnz/cmapx/actions/workflows/deploy.yml)

A free, **fully client-side** cybersecurity maturity self-check for New Zealand businesses.
A business owner with zero security knowledge answers ~30 plain-English Yes / No / Not-sure
questions and gets:

- an overall maturity level (1–5) and a **radar chart** of six areas,
- a **SWOT snapshot** (strengths, weaknesses, opportunities, threats),
- prioritised, plain-language **next steps**,
- a **cyber liability insurance** indication (informational only — references the Privacy Act 2020),
- a one-click **PDF export** of the whole report.

## Privacy by architecture

There is no backend, no database, no accounts and no analytics on answers. Responses live only in
browser memory and are never stored or transmitted. The PDF is generated in the browser. Closing
the tab erases everything. This is enforced by the build (`output: "export"`), not just by policy.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # scoring engine unit tests
npm run build    # static export to ./out
```

## Structure

- `lib/questions.ts` — the data-driven question set + categories (plain language).
- `lib/scoring.ts` — pure scoring engine (maturity, SWOT, insurance). Unit-tested.
- `lib/scoring.test.ts` — engine tests.
- `components/` — Wizard, Results, MaturityRadar, SwotGrid, InsurancePanel, ExportButton, ReportPdf.
- `app/` — Next.js App Router shell and page (holds all state in memory).

## Disclaimer

CMAP is an informational tool only. It is not affiliated with any insurer and does not sell
insurance. For decisions about cover, speak to a licensed adviser.
