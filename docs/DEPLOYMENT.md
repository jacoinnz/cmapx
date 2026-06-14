# Deploying to Vercel (via GitHub Actions)

The workflow `.github/workflows/deploy.yml` runs **two gates** on every push/PR to `main` — the unit
tests (`test`) and the Playwright browser smoke (`e2e`) — and only if **both** pass does it build
and deploy to Vercel using the Vercel CLI:

- **Push to `main`** → deploys to **production**.
- **Pull request to `main`** → deploys a **preview**.

```
push/PR → test ─┐
                ├─ deploy (needs both)
         e2e ───┘
```

It is intentionally a CLI-driven Action (not Vercel's native Git integration) so the gates and
build run inside GitHub Actions and you keep full control of the pipeline. See
[TESTING.md](TESTING.md) for what each gate covers.

## One-time setup

You need to link the repo to a Vercel project under the `mirutech` team and add three secrets to
GitHub. Do this once from your machine:

### 1. Create / link the Vercel project

```bash
npm i -g vercel
vercel login
# from the repo root:
vercel link --scope mirutech
#   ? Set up "cmap"? yes
#   ? Which scope? mirutech
#   ? Link to existing project? (create a new one called "cmap" if none)
```

This writes `.vercel/project.json` locally (already git-ignored), containing the two IDs you need:

```bash
cat .vercel/project.json
# { "orgId": "team_xxx", "projectId": "prj_xxx" }
```

### 2. Create a Vercel access token

Vercel dashboard → **Account Settings → Tokens → Create Token** (scope it to the `mirutech` team).
Copy the value.

### 3. Add the three secrets to GitHub

Either in the GitHub UI (repo → **Settings → Secrets and variables → Actions → New repository
secret**) or with the CLI:

```bash
gh secret set VERCEL_TOKEN       --body "<the token from step 2>"
gh secret set VERCEL_ORG_ID      --body "<orgId from project.json>"
gh secret set VERCEL_PROJECT_ID  --body "<projectId from project.json>"
```

### 4. Trigger a deploy

Push any commit to `main` (or re-run the latest workflow). The **Deploy** job prints the live URL
in its step summary.

## Notes

- The app is a **static export** (`output: "export"` in `next.config.mjs`). Vercel detects Next.js
  and serves the prebuilt static output — there is no server runtime, consistent with the
  "stores nothing" guarantee.
- The repo is currently **private**; when you first link it, authorise the Vercel GitHub app to
  access `jacoinnz/cmapx` (or flip the repo to public).
- If the Vercel secrets are missing, the **test** job still runs and passes; only the **deploy**
  job will fail until the three secrets are set.
