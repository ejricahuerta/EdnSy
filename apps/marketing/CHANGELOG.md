# Changelog

All notable changes to the **Lead Rosetta / EdnSy Marketing** app are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html) for the app version (`package.json`).

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

- PRD: Lead Rosetta v0.2 (see `docs/prd.md`).
- From this version onward, new features and breaking changes will be listed under new version headings.

---

## [Unreleased]

- **Send email to clients:** Automated send is now allowed on **Starter** (and Pro/Agency) so you can send email to clients with Resend configured. Checklist: set `RESEND_API_KEY` and `RESEND_FROM_EMAIL`, create a demo for a prospect with an email, set status to Approved, confirm AUP, then Send in Dashboard → Clients. Cut **v1.1.0** when you’ve successfully sent at least one email.
- (Add other changes here as you develop; move to a new `## [1.x.x] - date` section when you cut a release.)
