# Ed & Sy Admin app scripts (root)

These scripts live at repo root and operate on `apps/admin`. Run from repo root (e.g. `node scripts/cron-mock.mjs`) or via `pnpm run <script>` from `apps/admin`.

## Local mock cron (all processes)

- **Script:** `scripts/cron-mock.mjs`
- **Purpose:** Mimics the [Cloudflare cron worker](../apps/cron-worker/README.md) locally: one tick (default every 60s) and the same UTC minute rules as production — demo every tick; GBP / insights / batch when `minute % 2 / 3 / 5 === 0`; Website Template `GET /api/health` when `minute % 14 === 0`.
  - `GET /api/cron/jobs/demo` — paid demo first, then free try demos (same as production)
  - `GET /api/cron/jobs/gbp` — GBP fetch for prospects
  - `GET /api/cron/jobs/insights` — insights agent for pending scraped/GBP prospects
  - `GET /api/cron/schedule/batch` — batch enqueue up to 10× `new` → insights and 10× `demo pending` → demo queue
  - `GET {WEBSITE_TEMPLATE_URL}/api/health` — keep website-template warm (no auth)
- **Env (in `apps/admin/.env` or `.env.local`):**
  - `CRON_SECRET` — required (e.g. `my-local-cron-secret-16chars`)
  - `BASE_URL` — optional (default `http://localhost:5173`)
  - `CRON_INTERVAL_MS` — optional (default `60000`; use 60s to match the Worker — shorter values repeat Admin app calls within the same UTC minute)
  - `WEBSITE_TEMPLATE_URL` — optional (default `https://website-template.ednsy.com`)
- **Run (from repo root or apps/admin):**
  - From admin: `pnpm run cron:mock`
  - From repo root: `node scripts/cron-mock.mjs`
- **Legacy:** `pnpm run cron:mock-gbp` runs the same script (all crons).
- **Production:** The [Cloudflare Worker](../apps/cron-worker/README.md) uses one Cron Trigger per minute and the same minute-modulo branching. Set `CRON_SECRET` and `SITE_ORIGIN` in the app env.

## Sync keys to env

- **Script:** `scripts/sync-keys-to-env.mjs`
- **Purpose:** Copy `GOOGLE_PLACES_API_KEY` from repo-root `.keys.json` into `apps/admin/.env.local`.
- **Run from admin:** `pnpm run env:sync-keys` or from repo root: `node scripts/sync-keys-to-env.mjs`

## Download demo images

- **Script:** `scripts/download-demo-images.mjs`
- **Purpose:** Download Unsplash demo images to `apps/admin/static/images/demo/{industry}/`.
- **Run from repo root:** `node scripts/download-demo-images.mjs` or from admin: `pnpm run demo:download-images`

## Check Notion properties

- **Script:** `scripts/check-notion-properties.mjs`
- **Purpose:** Fetch Notion database schema and first page; verify property mapping. Requires `NOTION_API_KEY` and `NOTION_DATABASE_ID` in `apps/admin/.env`.
- **Run from repo root:** `node scripts/check-notion-properties.mjs`

## Get Supabase ref

- **Script:** `scripts/get-supabase-ref.mjs`
- **Purpose:** Print Supabase project ref from `SUPABASE_URL` in `apps/admin/.env`.
- **Run from repo root:** `node scripts/get-supabase-ref.mjs`

## External demo generator (website-template)

**Paid** demo jobs require all three env vars (no in-app fallback). When set, paid jobs are sent to the external API (avoids Vercel timeout):

- `DEMO_GENERATOR_URL` — base URL of the service (e.g. `https://website-template.ednsy.com`)
- `DEMO_GENERATOR_API_KEY` — sent as `Authorization: Bearer` when calling the API
- `DEMO_CALLBACK_SECRET` — shared secret; the service sends it back when POSTing to `/api/demo/generation-callback`

If any is unset, paid demo jobs fail with a clear error. Free-try demos and the dashboard inline "Generate demo" still use in-app generation. For local dev without the external service, use free-try or the dashboard inline create.

## GBP (Google Places API)

- GBP data is fetched via **Google Places API** (Text Search + Place Details). Set `GOOGLE_PLACES_API_KEY` (or `GOOGLE_MAPS_API_KEY`) in `apps/admin/.env.local`. Optional: `PLACES_API_MONTHLY_LIMIT` (default 10,000) caps lookups per month.
- **Sync keys:** From `apps/admin`, run `pnpm run env:sync-keys` to copy from repo-root `.keys.json` into `.env.local` as `GOOGLE_PLACES_API_KEY`.
