# EdnSy Marketing

SvelteKit app for the marketing CRM: Pro/Agency dashboard (prospects from connected CRM), industry demo pages, and (later) generate-demo + Resend email flow.

**Version:** See `package.json` (`version`). History and release notes: [CHANGELOG.md](CHANGELOG.md). Versioning policy: [docs/VERSION.md](docs/VERSION.md).

## Stack

- Svelte 5 + SvelteKit
- Tailwind v4
- **shadcn-svelte** for all dashboard-related pages (not used on the landing page or on industry demo pages)
- CRM integrations (HubSpot, GoHighLevel, Pipedrive, Notion); Resend (email). Env required for production.

## Setup

1. **Install dependencies**

   ```bash
   cd apps/marketing && npm install
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
   - **Twilio (F4 SMS):** Optional / backlogged (no budget, low traction). If you enable it: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` (E.164). When set, Send will also send SMS to prospects with a phone number.
   - `MARKETING_API_KEY` - optional, for protecting API routes
   - **Google login** (for `/dashboard` and auth):
     - `GOOGLE_CLIENT_ID` - Google OAuth client ID (Cloud Console)
     - `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
     - `SESSION_SECRET` - at least 16 characters; used to sign session cookies
   - **Supabase (demo tracking,** optional): when set, the app records each created demo in Supabase for tracking (CRM id, demo link, status, send time, scraped data).
     - `SUPABASE_URL` - your Supabase project URL
     - `SUPABASE_SERVICE_ROLE_KEY` - service role key (server-only; do not expose to the client)
   - **Gemini (AI audit,** optional): when set, creating a demo generates an AI audit from the prospect's name, industry, and website (stored in Supabase, shown on the demo page). Use `GEMINI_API_KEY` (same as chat widget).
   - **Retell AI (callback,** optional): when set, the demo chat widget shows a "Request a callback" button that opens a dialog; submitting triggers an outbound call via the Retell API. Set `RETELL_API_KEY` (server-only, from [Retell Dashboard](https://docs.retellai.com/accounts/api-keys-overview)), and either `RETELL_PHONE_NUMBER` + `RETELL_AGENT_ID` or the public equivalents `PUBLIC_RETELL_PHONE_NUMBER` and `PUBLIC_RETELL_AGENT_ID` (E.164 for phone; voice agent ID).
   - **Stripe (billing):** for Pro subscription and checkout: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO` (Stripe Price IDs), and after adding the webhook in Stripe Dashboard: `STRIPE_WEBHOOK_SECRET`. Run the `subscriptions` Supabase migration so the `subscriptions` table exists.

   Add your app’s **Authorized redirect URI** in Google Cloud Console:  
   `http://localhost:5173/auth/google/callback` (dev) or your production origin + `/auth/google/callback`.

   **Prospects / dashboard:** The dashboard shows prospects from whatever CRM you connect (HubSpot, GoHighLevel, Pipedrive, or Notion). There is no single required database; connect at least one integration in Dashboard → Integrations. Each prospect is stored with **provider** and **provider_row_id**; we sync status and tracking by id. Without any connected integration, the dashboard list is empty. Without Google/SESSION_SECRET, **Sign in** and `/dashboard` require auth to be configured.

   **Send email to clients (v1):** The send flow is **dashboard/CRM only** (create the demo in Dashboard → Clients, then send from there; not from /try or /upload). You need: (1) `RESEND_API_KEY` and `RESEND_FROM_EMAIL` (and optionally `RESEND_FROM_NAME`); verify your domain in [Resend](https://resend.com); (2) at least one prospect with an **email** and a **demo** created in the dashboard; (3) set the prospect’s status to **Approved**; (4) check the Acceptable Use Policy box and click **Send** in Dashboard → Clients. Starter and above can use the Send button. You can add a **test client** (no CRM) from Dashboard → Clients → **Add test client**. Full checklist: [docs/next-steps-first-send.md](docs/next-steps-first-send.md).

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

   Copy each file’s contents into the editor and run it.

   **Option B – Supabase CLI**  
   The app includes `supabase/config.toml` and the Supabase CLI (via the `supabase` dependency). From `apps/marketing`:

   ```bash
   npm run db:link   # enter project ref and database password when prompted
   npm run db:push
   ```

   Or with npx: `npx supabase link` then `npx supabase db push`. If you still see “The system cannot find the path specified” on Windows, use Option A.

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
   - In Vercel: Project → **Settings** → **General** → **Root Directory** → set to `apps/marketing`.
   - This ensures Vercel builds and runs this app, not the repo root.

3. **Environment variables** (Project → **Settings** → **Environment Variables**):
   - Add CRM/integration env vars if using Notion: `NOTION_API_KEY`, `NOTION_DATABASE_ID`. Other CRMs are configured in Dashboard → Integrations.
   - Add Google OAuth and session vars if you use `/dashboard`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`.
   - Use the **exact** names above (case-sensitive). Assign to **Production** (and **Preview** if you use preview deployments).

4. **Redeploy** after adding or changing env vars (Deployments → ⋯ → Redeploy).

If you see “an empty prospects list” on Vercel, connect at least one integration in Dashboard → Integrations and confirm Root Directory is `apps/marketing` and any required env vars for that integration are set.

## Routes

- `/` - marketing home
- `/dashboard` - Pro & Agency dashboard (prospects from connected CRM); **requires Google sign-in**
- `/prospects` - redirects to `/dashboard` (legacy URL)
- `/auth/login` - sign-in page (link to Google)
- `/auth/google` - starts Google OAuth (redirect)
- `/auth/logout` - clears session and redirects to `/`
- `/dashboard/billing` - plan and upgrade (Stripe Checkout); manage subscription (Stripe Customer Portal) when applicable
- `/healthcare/[id]` - healthcare demo (prospect id from connected CRM)
- `/dental/[id]` - dental demo (prospect id); more industry routes to be added
