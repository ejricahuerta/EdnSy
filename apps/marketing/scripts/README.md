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

## GBP (Google Places API)

- GBP data is fetched via **Google Places API** (Text Search + Place Details). Set `GOOGLE_PLACES_API_KEY` (or `GOOGLE_MAPS_API_KEY`) in `apps/marketing/.env.local`. Optional: `PLACES_API_MONTHLY_LIMIT` (default 10,000) caps lookups per month.
- **Sync keys:** From `apps/marketing`, run `npm run env:sync-keys` to copy `keys.google.placesApiKey` or `keys.google.apiKey` from repo-root `.keys.json` into `.env.local` as `GOOGLE_PLACES_API_KEY`.
