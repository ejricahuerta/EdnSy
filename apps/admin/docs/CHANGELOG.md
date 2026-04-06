# Changelog

All notable changes to **Ed & Sy Admin** (formerly Lead Rosetta / Lead Rosetta marketing naming in older commits) are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html) for the app version (`package.json`).

---

## [Unreleased]

### Added

- **Prospects realtime:** Supabase Realtime subscriptions for prospect and job updates, with RLS-focused migration (`prospects_jobs_rls_realtime` and related auth alignment). In-dashboard notifications and tighter sync between Google session and Supabase JWT for the browser client.
- **Monorepo documentation:** Root [`docs/README.md`](../../../docs/README.md) index for Admin, Landing, and Website Template; expanded Admin [`architecture.md`](architecture.md) (stack, hooks, Places GBP, Website Template callbacks) and Website Template [`architecture.md`](../../website-template/docs/architecture.md).

### Changed

- **Product naming:** User-facing and internal rename from “Lead Rosetta” to **Ed & Sy Admin**; app directory renamed from `apps/lead-rosetta` to **`apps/admin`** (paired with `apps/website-template`).
- **Theme:** Dark mode readability and parity with the marketing site; simplified login page (larger logo); sidebar brand row (logo + “Admin”) and nav type scale.
- **Job polling:** Consolidated polling for demo jobs, GBP jobs, and insights; polling runs **in the browser only** to avoid SSR duplicate requests.
- **Supabase client:** `@supabase/supabase-js` bumped for `@supabase/ssr` compatibility; browser client uses **dynamic public env** for URL/anon key (Vercel-safe).
- **Documentation:** PRD implementation snapshot and pre-launch checklist updates; demo payload doc aligned with Website Template async endpoint used by `processDemoJob`; Taskmaster tasks (e.g. Stripe billing task marked done, dashboard/CRM wording); README route list (`/demo/...`, `/show`). Standalone `/try` route removed (redirect to `/auth/login`).

### Fixed

- **Vercel build:** Integrations UI (Select) and Supabase env handling no longer block production builds.
- **AI agent prompts:** Saving custom agent content no longer falls back to a default prompt when a save path fails (stricter behavior).

### Notes

- **Send email to clients:** Automated send is allowed on **Starter** (and Growth/Agency) when Resend is configured. Checklist: set `RESEND_API_KEY` and `RESEND_FROM_EMAIL`, create a demo for a prospect with an email, set status to **Approved**, confirm AUP, then **Send** in Dashboard → Prospects. Cut **v1.1.0** when at least one email has been successfully sent.
- **Cron / generator env:** Shared monorepo chore removed legacy “Pitch Rosetta” env aliases in favor of **Website Template** naming; use `DEMO_GENERATOR_*` and cron docs in [`README.md`](../README.md) and [`cron-worker`](../../cron-worker/README.md).

---

## [1.0.0] - 2026-03-01

**Baseline release (pre–first-send).** This version marks a clear split: everything built up to this point is v1.0. **We have not successfully sent a message yet** (email or SMS). The send pipeline (Resend, optional Twilio) and UI are in place; the next milestone is a verified successful send.

### Added

- **Dashboard (Pro/Agency)**
  - Prospects list from connected CRM (HubSpot, GoHighLevel, Pipedrive, Notion)
  - Integrations management (connect/disconnect CRMs)
  - Billing: Stripe Checkout (Starter/Pro), Customer Portal for subscription management
  - Overview and templates surfaces (Supabase-backed where configured)
  - shadcn-svelte UI for all dashboard routes
- **Auth**
  - Google OAuth sign-in; session via `SESSION_SECRET`
  - Protected `/dashboard`; login/logout routes
- **Industry demos**
  - Demo pages by prospect id (e.g. `/healthcare/[id]`, `/dental/[id]`)
  - Industry style guides and templates (construction, healthcare, dental, legal, fitness, solo-professionals, real-estate, salon-and-spa, generic)
- **Outreach (pipeline in place; not yet verified)**
  - Resend email (F4 flow) and optional Twilio SMS – **no successful send yet**
  - Demo tracking in Supabase (created, opened, clicked)
  - Optional Gemini-powered AI audit stored in Supabase
- **Data**
  - Supabase migrations: demo_tracking, subscriptions, crm_connections, notion_connections, pipedrive, prospects_central, dashboard_overview, user_templates
  - Central prospects model keyed by provider + provider_row_id; status/tracking synced by id
- **Stack**
  - Svelte 5, SvelteKit, Tailwind v4, shadcn-svelte (dashboard only)

### Notes

- PRD: see [`prd.md`](prd.md) (Ed & Sy Admin product requirements).
- From this version onward, new features and breaking changes are listed under **[Unreleased]** or new version headings.
