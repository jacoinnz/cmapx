# Backend setup (Phase 4)

The app is **local-first and fully usable with no backend**. Cloud features
(live benchmarking now; accounts + cloud sync next) light up only when the
relevant environment variables are present — otherwise they degrade gracefully
(benchmark falls back to the seeded model, contribution button reports
"not live yet").

## 4c-1 — Live benchmarking (database only)

Needs a Postgres database. We use **Neon** via the Vercel Marketplace.

### 1. Provision Neon on Vercel
- Vercel dashboard → your `cmap` project → **Storage** → **Create Database** →
  **Neon** (Postgres) → follow the prompts.
- This auto-adds `DATABASE_URL` (and related vars) to the project's environment.

### 2. Pull the env var locally
```bash
vercel env pull .env.local
```
Confirm `.env.local` now contains `DATABASE_URL=postgres://…`.

### 3. Create the table
```bash
npm run db:push      # applies lib/db/schema.ts to the database
```
(Or apply `lib/db/migrations/0000_init_submissions.sql` by hand.)

### 4. Deploy
```bash
vercel --prod
```

That's it. Once `DATABASE_URL` is set:
- Completing a check shows a **"＋ Add my score to NZ benchmarks"** button
  (opt-in, anonymous — sends only `{ path, overallPct }`, no answers, no
  identity).
- After **30+** submissions for a path, the benchmark band switches from
  "indicative" (seeded) to **live** ("Live benchmark from N anonymous NZ
  checks").

### What's stored
| Table | Columns | Identifying? |
|---|---|---|
| `submissions` | `path`, `overall_pct`, `created_at` | **No** — no user, no answers, no IP |

## 4c-2 — Accounts + cloud sync (next)

Will add Auth.js (magic-link via **Resend**) + a `results` table keyed to a
user, so results can sync across devices. Needs `AUTH_SECRET`, `RESEND_API_KEY`,
and an Auth.js email-from address. Documented here when built.
