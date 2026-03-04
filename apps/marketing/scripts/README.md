# Marketing app scripts

## Local mock cron (all processes)

- **Script:** `cron-mock.mjs`
- **Purpose:** Mimics Vercel Cron locally: calls both cron endpoints on an interval so demo and GBP jobs run when the dev server is up (no Vercel Cron locally).
  - `GET /api/cron/jobs/demo` — paid demo first, then free try demos (same as production)
  - `GET /api/cron/jobs/gbp` — GBP fetch for prospects
- **Env (in `.env` or `.env.local`):**
  - `CRON_SECRET` — required (e.g. `my-local-cron-secret-16chars`)
  - `BASE_URL` — optional (default `http://localhost:5173`)
  - `CRON_INTERVAL_MS` — optional (default `60000` = 60s, min 10000)
- **Run (from repo root or apps/marketing):**
  - `pnpm run cron:mock` or `node apps/marketing/scripts/cron-mock.mjs`
- **Legacy:** `pnpm run cron:mock-gbp` runs the same script (all crons).
- **Production:** Vercel Cron hits these paths on schedule (`vercel.json`: demo every 1 min, GBP every 2 min). Set `CRON_SECRET` and `SITE_ORIGIN` in Vercel env.

## DataForSEO GBP (Google Business Profile) test

- **Scripts:** `test-dataforseo-gbp.mjs`, `test-dataforseo-gbp.ps1`
- **Purpose:** Hit the same DataForSEO `my_business_info` API the app uses (task_post → poll task_get) to debug GBP lookups.
- **Credentials:**
  - The **app** uses **`apps/marketing/.env.local`**: `DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD`.
  - Scripts prefer `apps/marketing/.env.local` and fall back to repo-root **`.keys.json`**: `dataforseo.login`, `dataforseo.password`.
  - To sync `.keys.json` into `.env.local`: from `apps/marketing`, run `npm run env:sync-keys`.
- **Run (from repo root):**
  - Node: `node apps/marketing/scripts/test-dataforseo-gbp.mjs [output-dir-name]`
  - PowerShell: `pwsh -File apps/marketing/scripts/test-dataforseo-gbp.ps1`
- **Output:** `apps/marketing/scripts/output/<dir>/post.json` (task_post response), `result.json` (task_get response). Inspect `result.json` to see what DataForSEO returned.
- **Status codes:** 20000 = success; 40102 = No Search Results (no GBP for that keyword/location); 40602 = Task in Queue (keep polling); 40100 = Unauthorized. The script exits on 20000, 40102, or other terminal codes instead of timing out.
- **App behavior:** The app uses the same API and, when the primary location (e.g. Toronto or prospect city) returns no result, tries a US fallback (`Houston,Texas,United States`) before failing with "GBP not found or unavailable".
