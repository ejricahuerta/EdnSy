# Ed & Sy Lead Rosetta

SvelteKit app for the lead-rosetta CRM: Pro/Agency dashboard (prospects from connected CRM), industry demo pages, and (later) generate-demo + Resend email flow.

**Version:** See `package.json` (`version`). History and release notes: [CHANGELOG.md](CHANGELOG.md). Versioning policy: [docs/VERSION.md](docs/VERSION.md).

## Stack

- Svelte 5 + SvelteKit
- Tailwind v4
- **shadcn-svelte** for all dashboard-related pages (not used on the landing page or on industry demo pages)
- CRM integrations (HubSpot, GoHighLevel, Pipedrive, Notion); Resend (email). Env required for production.

## Architecture

Core engines (Demo, Insights, GBP, Prospects, Send, Auth, CRM, Billing, Supabase, User settings) and lib layout are documented in **[docs/architecture.md](docs/architecture.md)**. Use `$lib/demo`, `$lib/insights`, `$lib/server/demo`, and `$lib/server/insights` as the main entry points for demo and insight features.

## Setup

1. **Install dependencies**

   ```bash
   cd apps/lead-rosetta && npm install
   ```

   On Windows, if `npm run build` fails with a Rollup error (`@rollup/rollup-win32-x64-msvc`), try:

   ```bash
   rm -r node_modules package-lock.json   # or on PowerShell: Remove-Item -Recurse node_modules; Remove-Item package-lock.json
   npm install
   ```

   Or use **pnpm** in the repo if available; it often handles optional dependencies better.

2. **Environment**

   Copy `.env.example` to `.env` and set:

   - **CRM / Integrations:** Connect one or more sources in Dashboard → Integrations (HubSpot, GoHighLevel, Pipedrive, or Notion). For Notion you need `NOTION_API_KEY` and `NOTION_DATABASE_ID` (create at [notion.so/my-integrations](https://www.notion.so/my-integrations); share the database with your integration). Prospects are synced into the dashboard keyed by **provider** and **provider_row_id**; status and tracking are stored on our side and synced back by id where supported.
   - **Resend (F4 email):** `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_FROM_NAME`. Default (dev) is `onboarding@resend.dev`; for production set `RESEND_FROM_EMAIL=leadrosetta@ednsy.com` and `RESEND_FROM_NAME=Lead Rosetta`, then verify the domain in Resend. Required for the Send button.
   - **SITE_ORIGIN (production):** Set to your public app URL (e.g. `https://app.ednsy.com`) when deploying. Used for links in outgoing emails and stored demo URLs so recipients get a clickable link instead of localhost. If unset, the request origin is used (fine for local dev).
   - **Cron (optional):** A [Cloudflare Worker](../cron-worker/README.md) calls `GET /api/cron/jobs/demo` every 1 minute and `GET /api/cron/jobs/gbp` every 2 minutes (avoids Vercel cron limits). Set **CRON_SECRET** (16+ chars) in both Vercel and the Worker; routes reject requests without `Authorization: Bearer <CRON_SECRET>`. Demo cron requires **SITE_ORIGIN** so demo links are correct. **Local:** Run `pnpm run cron:mock` (with dev server and `CRON_SECRET` in `.env`); see [scripts/README.md](../../scripts/README.md).
   - **Twilio (F4 SMS):** Optional / backlogged (no budget, low traction). If you enable it: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` (E.164). When set, Send will also send SMS to prospects with a phone number.
   - `MARKETING_API_KEY` - optional, for protecting API routes
   - **Google login** (for `/dashboard` and auth):
     - `AUTH_GOOGLE_CLIENT_ID` - Google OAuth client ID (Cloud Console)
     - `AUTH_GOOGLE_CLIENT_SECRET` - Google OAuth client secret
     - `SESSION_SECRET` - at least 16 characters; used to sign session cookies
   - **Supabase (demo tracking,** optional): when set, the app records each created demo in Supabase for tracking (CRM id, demo link, status, send time, scraped data).
     - `SUPABASE_URL` - your Supabase project URL
     - `SUPABASE_SERVICE_ROLE_KEY` - service role key (server-only; do not expose to the client)
   - **Demos (scraped data required):** Creating a demo only works when scraped data is available. You must configure **at least one** of Places API or Gemini in `.env`. If you see *"Scraped data is required to run the demo. Configure Places API (GOOGLE_PLACES_API_KEY) or Gemini (GEMINI_API_KEY) in .env and try again."*, add the missing credentials below.
   - **Google Places API (GBP data):** when set, creating a demo fetches business data (name, address, phone, website, rating, hours) via Google Places API (Text Search + Place Details) and builds the audit from it; otherwise the app falls back to Gemini. Enable [Places API (New)](https://developers.google.com/maps/documentation/places/web-service/overview) in Google Cloud, create an API key, and set `GOOGLE_PLACES_API_KEY` (or `GOOGLE_MAPS_API_KEY`). Optional: `PLACES_API_MONTHLY_LIMIT` (default 10,000) caps lookups per month so you stay within the free tier; the app blocks new requests when the limit is reached.
   - **Gemini (AI audit fallback):** when Places API is not configured or GBP fetch fails, creating a demo uses Gemini to generate a synthetic audit from the prospect's name, industry, and website. Set `GEMINI_API_KEY` (same as chat widget). With `GEMINI_API_KEY` set, creating a demo also generates personalized landing content (hero, CTA, services) for the industry demo page.
   - **Claude (in-app demos):** free-try and dashboard inline "Generate demo" use Claude to generate a single-file HTML landing page; HTML is saved to Supabase **demo-html** and served at `/demo/[id]/page.html`. Set `CLAUDE_API_KEY` (or `ANTHROPIC_API_KEY`) in `.env`. If no demo-html exists, the app falls back to the legacy Gemini + pageJson flow.
   - **External demo generator (pitch-rosetta,** required for paid demos): **Paid** demo jobs require `DEMO_GENERATOR_URL`, `DEMO_GENERATOR_API_KEY`, and `DEMO_CALLBACK_SECRET` (no in-app fallback). The app POSTs to the external API (e.g. pitch-rosetta on Render), gets 202, and the service runs generation in the background then POSTs to `/api/demo/generation-callback` (avoids Vercel timeout). If any of the three is unset, paid demo jobs fail with a clear error. For local dev without the external service, use free-try or dashboard inline "Generate demo".
   - **Pexels (demo images,** recommended): when `PEXELS_API_KEY` is set (from [Pexels API](https://www.pexels.com/api)), demo pages use Pexels search for hero and about images. Request a key at [pexels.com/api](https://www.pexels.com/api).
   - **Unsplash (demo images fallback,** optional): when Pexels is not configured, `UNSPLASH_ACCESS_KEY` (from [Unsplash Developers](https://unsplash.com/developers)) is used for search-based hero and about images. Otherwise, industry default image URLs are used.
   - **Retell AI (callback,** optional): when set, the demo chat widget shows a "Request a callback" button that opens a dialog; submitting triggers an outbound call via the Retell API. Set `RETELL_API_KEY` (server-only, from [Retell Dashboard](https://docs.retellai.com/accounts/api-keys-overview)), and either `RETELL_PHONE_NUMBER` + `RETELL_AGENT_ID` or the public equivalents `PUBLIC_RETELL_PHONE_NUMBER` and `PUBLIC_RETELL_AGENT_ID` (E.164 for phone; voice agent ID).
   - **Stripe (billing):** for Pro subscription and checkout: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO` (Stripe Price IDs), and after adding the webhook in Stripe Dashboard: `STRIPE_WEBHOOK_SECRET`. Run the `subscriptions` Supabase migration so the `subscriptions` table exists.

   Add your app's **Authorized redirect URI** in Google Cloud Console:
   `http://localhost:5173/auth/google/callback` (dev) or your production origin + `/auth/google/callback`.

   **Prospects / dashboard:** The dashboard shows prospects from whatever CRM you connect (HubSpot, GoHighLevel, Pipedrive, or Notion). There is no single required database; connect at least one integration in Dashboard → Integrations. Each prospect is stored with **provider** and **provider_row_id**; we sync status and tracking by id. Without any connected integration, the dashboard list is empty. Without Google/SESSION_SECRET, **Sign in** and `/dashboard` require auth to be configured.

   **Send email to clients (v1):** The send flow is **dashboard/CRM only** (create the demo in Dashboard → Prospects, then send from there; not from /try or /upload). You need: (1) `RESEND_API_KEY` and `RESEND_FROM_EMAIL` (and optionally `RESEND_FROM_NAME`); verify your domain in [Resend](https://resend.com); (2) at least one prospect with an **email** and a **demo** created in the dashboard; (3) set the prospect's status to **Approved**; (4) check the Acceptable Use Policy box and click **Send** in Dashboard → Prospects. Starter and above can use the Send button. You can add a **test client** (no CRM) from Dashboard → Prospects → **Add test client**. Full checklist: [docs/next-steps-first-send.md](docs/next-steps-first-send.md).

3. **Database migrations (Supabase)**

   If you use Supabase for demo tracking and prospects, run the migrations so the `prospects` table and `demo_tracking.prospect_id` exist.

   **Option A – Supabase Dashboard (recommended if CLI fails)**
   In [Supabase](https://supabase.com/dashboard) → your project → **SQL Editor**, run the migration files in order (oldest first):

   - `supabase/migrations/20260228120000_demo_tracking.sql`
   - `supabase/migrations/20260228140000_demo_tracking_opened_clicked.sql`
   - `supabase/migrations/20260228160000_subscriptions.sql`
   - `supabase/migrations/20260228180000_crm_connections.sql`
   - `supabase/migrations/20260228182000_notion_connections.sql`
   - `supabase/migrations/20260228183000_crm_add_pipedrive.sql`
   - `supabase/migrations/20260228200000_prospects_central.sql`
   - `supabase/migrations/20260301120000_dashboard_overview.sql`
   - `supabase/migrations/20260301140000_user_templates.sql`
   - `supabase/migrations/20260301160000_prospects_allow_manual.sql`
   - `supabase/migrations/20260302120000_demo_events.sql`
   - `supabase/migrations/20260303100000_consolidated_prospects_user_settings_crm_flagged.sql`
   - `supabase/migrations/20260303120000_prospects_add_address.sql`
   - `supabase/migrations/20260304120000_demo_jobs.sql`

   Copy each file's contents into the editor and run it.

   **Option B – Supabase CLI**
   The app includes `supabase/config.toml` and the Supabase CLI (via the `supabase` dependency). From `apps/lead-rosetta`:

   1. Log in (once): `npx supabase login`
   2. Link using your project ref (from the Supabase dashboard URL or in `.env`; from repo root: `node scripts/get-supabase-ref.mjs`):
      ```bash
      npx supabase link --project-ref YOUR_PROJECT_REF
      ```
      Enter your database password when prompted.
   3. Push migrations:
      ```bash
      npm run db:push
      ```

   If you see "The system cannot find the path specified" on Windows, use Option A.

4. **Run**

   ```bash
   npm run dev
   ```

   - Home: http://localhost:5173
   - Dashboard (Pro/Agency): http://localhost:5173/dashboard
   - Demo pages use prospect id (from the connected CRM), e.g. http://localhost:5173/healthcare/[id]

## Deploy (Vercel)

1. **Connect the repo** to Vercel and import the project.

2. **Set Root Directory** (if this app lives in a monorepo):
   - In Vercel: Project → **Settings** → **General** → **Root Directory** → set to `apps/lead-rosetta`.
   - This ensures Vercel builds and runs this app, not the repo root.

3. **Environment variables** (Project → **Settings** → **Environment Variables**):
   - Add CRM/integration env vars if using Notion: `NOTION_API_KEY`, `NOTION_DATABASE_ID`. Other CRMs are configured in Dashboard → Integrations.
   - Add Google OAuth and session vars if you use `/dashboard`: `AUTH_GOOGLE_CLIENT_ID`, `AUTH_GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`.
   - Use the **exact** names above (case-sensitive). Assign to **Production** (and **Preview** if you use preview deployments).

4. **Redeploy** after adding or changing env vars (Deployments → ⋯ → Redeploy).

If you see "an empty prospects list" on Vercel, connect at least one integration in Dashboard → Integrations and confirm Root Directory is `apps/lead-rosetta` and any required env vars for that integration are set.

## Routes

- `/` - lead-rosetta home
- `/dashboard` - Pro & Agency dashboard (prospects from connected CRM); **requires Google sign-in**
- `/prospects` - redirects to `/dashboard` (legacy URL)
- `/auth/login` - sign-in page (link to Google)
- `/auth/google` - starts Google OAuth (redirect)
- `/auth/logout` - clears session and redirects to `/`
- `/dashboard/billing` - plan and upgrade (Stripe Checkout); manage subscription (Stripe Customer Portal) when applicable
- `/healthcare/[id]` - healthcare demo (prospect id from connected CRM)
- `/dental/[id]` - dental demo (prospect id); more industry routes to be added
