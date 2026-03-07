# Lead Rosetta app scripts (root)

These scripts live at repo root and operate on `apps/lead-rosetta`. Run from repo root (e.g. `node scripts/cron-mock.mjs`) or via `pnpm run <script>` from `apps/lead-rosetta`.

## Local mock cron (all processes)

- **Script:** `scripts/cron-mock.mjs`
- **Purpose:** Mimics Vercel Cron locally: calls both cron endpoints on an interval so demo and GBP jobs run when the dev server is up (no Vercel Cron locally).
  - `GET /api/cron/jobs/demo` — paid demo first, then free try demos (same as production)
  - `GET /api/cron/jobs/gbp` — GBP fetch for prospects
- **Env (in `apps/lead-rosetta/.env` or `.env.local`):**
  - `CRON_SECRET` — required (e.g. `my-local-cron-secret-16chars`)
  - `BASE_URL` — optional (default `http://localhost:5173`)
  - `CRON_INTERVAL_MS` — optional (default `60000` = 60s, min 10000)
- **Run (from repo root or apps/lead-rosetta):**
  - From lead-rosetta: `pnpm run cron:mock`
  - From repo root: `node scripts/cron-mock.mjs`
- **Legacy:** `pnpm run cron:mock-gbp` runs the same script (all crons).
- **Production:** A cron (e.g. [Cloudflare Worker](../apps/cron-worker/README.md) or Vercel Cron) hits these paths on schedule (demo every 1 min, GBP every 2 min). Set `CRON_SECRET` and `SITE_ORIGIN` in the app env.

## Sync keys to env

- **Script:** `scripts/sync-keys-to-env.mjs`
- **Purpose:** Copy `GOOGLE_PLACES_API_KEY` from repo-root `.keys.json` into `apps/lead-rosetta/.env.local`.
- **Run from lead-rosetta:** `pnpm run env:sync-keys` or from repo root: `node scripts/sync-keys-to-env.mjs`

## Download demo images

- **Script:** `scripts/download-demo-images.mjs`
- **Purpose:** Download Unsplash demo images to `apps/lead-rosetta/static/images/demo/{industry}/`.
- **Run from repo root:** `node scripts/download-demo-images.mjs` or from lead-rosetta: `pnpm run demo:download-images`

## Check Notion properties

- **Script:** `scripts/check-notion-properties.mjs`
- **Purpose:** Fetch Notion database schema and first page; verify property mapping. Requires `NOTION_API_KEY` and `NOTION_DATABASE_ID` in `apps/lead-rosetta/.env`.
- **Run from repo root:** `node scripts/check-notion-properties.mjs`

## Get Supabase ref

- **Script:** `scripts/get-supabase-ref.mjs`
- **Purpose:** Print Supabase project ref from `SUPABASE_URL` in `apps/lead-rosetta/.env`.
- **Run from repo root:** `node scripts/get-supabase-ref.mjs`

## External demo generator (pitch-rosetta)

**Paid** demo jobs require all three env vars (no in-app fallback). When set, paid jobs are sent to the external API (avoids Vercel timeout):

- `DEMO_GENERATOR_URL` — base URL of the service (e.g. `https://pitch-rosetta.onrender.com`)
- `DEMO_GENERATOR_API_KEY` — sent as `Authorization: Bearer` when calling the API
- `DEMO_CALLBACK_SECRET` — shared secret; the service sends it back when POSTing to `/api/demo/generation-callback`

If any is unset, paid demo jobs fail with a clear error. Free-try demos and the dashboard inline "Generate demo" still use in-app generation. For local dev without the external service, use free-try or the dashboard inline create.

## GBP (Google Places API)

- GBP data is fetched via **Google Places API** (Text Search + Place Details). Set `GOOGLE_PLACES_API_KEY` (or `GOOGLE_MAPS_API_KEY`) in `apps/lead-rosetta/.env.local`. Optional: `PLACES_API_MONTHLY_LIMIT` (default 10,000) caps lookups per month.
- **Sync keys:** From `apps/lead-rosetta`, run `pnpm run env:sync-keys` to copy from repo-root `.keys.json` into `.env.local` as `GOOGLE_PLACES_API_KEY`.
