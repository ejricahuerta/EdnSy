# Ed & Sy Admin App — Architecture

This document describes the **technology stack**, **core engines**, **data flow**, and how **`$lib`** is organized. Use it when onboarding, refactoring, or adding features.

**Last updated:** March 2026

---

## Technology stack

| Layer | Choices |
|-------|---------|
| Framework | **SvelteKit 2** (Vite), **Svelte 5** (runes), **TypeScript** |
| Styling | **Tailwind CSS v4** (`@tailwindcss/vite`), component tokens via shadcn-svelte on **dashboard routes only** |
| Package manager | **pnpm** (see root / `apps/admin` `packageManager`) |
| Adapter | `@sveltejs/adapter-auto` (typical deploy: **Vercel** with Root Directory `apps/admin`) |
| Database / auth (browser) | **Supabase** — `@supabase/ssr` in `src/hooks.server.ts` creates a per-request server client; **PUBLIC_SUPABASE_URL** + **PUBLIC_SUPABASE_ANON_KEY** are required at startup |
| Database (server) | **Supabase** service role for jobs, prospects, `demo_tracking`, CRM connections, etc. (`$lib/server/supabase`) |
| Dashboard sign-in | **Google OAuth** via `$lib/server/googleAuth` (not Supabase-hosted OAuth redirect); after sign-in, server uses **`signInWithIdToken`** so the browser Supabase client can use Realtime under RLS |
| Payments | **Stripe** — checkout, portal, webhooks (`$lib/server/stripe`, `/api/stripe/*`) |
| Email / SMS | **Resend**, optional **Gmail** OAuth, **Twilio** (optional) via `$lib/server/send` |
| AI | **Gemini** (insights, copy), **Claude** (inline HTML demos), optional **Retell** for voice callback |
| GBP data | **Google Places API** (`$lib/server/placesApi`, `$lib/server/gbp.ts`), not DataForSEO in current code |
| Background work | **Demo / GBP / insights jobs** in Postgres; processing triggered by **`/api/cron/*`** (Bearer **CRON_SECRET**) or **`POST /api/jobs/*`**; optional **Cloudflare Worker** in `apps/cron-worker` to hit cron routes on a schedule |

### Monorepo context

- **`apps/landing`** — public marketing site (separate SvelteKit app).
- **`apps/website-template`** — Node **Express** service that generates landing HTML for **paid** demo jobs; Admin calls it asynchronously and receives results on **`/api/demo/generation-callback`**. See [demo-payload-website-template.md](demo-payload-website-template.md) and `apps/website-template/docs/architecture.md`.
- **`apps/cron-worker`** — optional scheduler for Admin cron endpoints.

---

## 1. Core Engines

The app is built around these functional areas. Each has a clear responsibility and maps to specific `$lib` modules.

| Engine | Responsibility | Lib entry points |
|--------|----------------|------------------|
| **Demo** | Build, store, and serve personalized demo pages (themes, page.json, tracking, free-demo flow). | `$lib/demo`, `$lib/server/demo` |
| **Insights** | AI-generated business assessment (grade, summary, recommendations, audit modal copy, industry inference). | `$lib/insights`, `$lib/server/insights` |
| **GBP** | Google Business Profile data: fetch via **Google Places API**, shape scraped data for demos and audit. | `$lib/server/gbp`, `$lib/server/placesApi` |
| **Prospects** | Lead/prospect lifecycle: CRUD, flagging, sync from CRM, demo link and status. | `$lib/server/prospects` |
| **Send** | Outbound email (Resend/Gmail) and SMS (Twilio); templates and body builders. | `$lib/server/send` |
| **Auth** | Who is signed in: session, Google/Gmail OAuth, Gmail tokens. | `$lib/server/session`, `$lib/server/googleAuth`, `$lib/server/gmailAuth`, `$lib/server/gmail` |
| **CRM** | External CRM connections and sync (HubSpot, GoHighLevel, Pipedrive, Notion); context for chat/overview. | `$lib/server/crm`, `$lib/server/notion`, `$lib/server/crmContext` |
| **Billing** | Stripe subscriptions, plan tier, demo/send limits, internal “teams” override. | `$lib/server/stripe`, `$lib/plans` |
| **Supabase** | Persistence: demo_tracking, demo_jobs, scraped_data, overview cache, CRM connections, prospects. | `$lib/server/supabase` |
| **User settings** | Per-user config: GBP default location, email sender, demo banner, Resend/Gmail config, CRM industry filter. | `$lib/server/userSettings` |

### How they connect

- **Prospects** + **CRM** + **Auth** → who the user is and which leads they have.
- **GBP** + **Insights** → business data and AI assessment for a lead.
- **Demo** → builds and serves the demo; **Send** → emails/SMS the link.
- **Supabase** → stores tracking, jobs, scraped_data, settings.
- **Billing** + **Plans** → what the user is allowed (demos/month, send, etc.).

### Request lifecycle (simplified)

1. **`hooks.server.ts`** — Ensures Supabase URL + anon key exist; attaches `event.locals.supabase` and `getSession()` for SSR and Realtime-aligned cookies.
2. **`+layout.server.ts`** (root) — Loads session user for Google dashboard auth and **`getPlanForUser`** (Stripe) where applicable.
3. **Protected routes** — e.g. `src/lib/server/authDashboard.ts` patterns for `/dashboard/*`.

### Paid demo generation and Website Template

- **Queue:** `demo_jobs` rows processed by **`processOneDemoJob`** in `$lib/server/processDemoJob.ts` (invoked from **`POST /api/jobs/demo`** and cron **`GET /api/cron/jobs/demo`**).
- **Requirement:** Env **`DEMO_GENERATOR_URL`**, **`DEMO_GENERATOR_API_KEY`**, **`DEMO_CALLBACK_SECRET`**. If any are missing, paid jobs fail fast with a clear error (no in-process HTML substitute).
- **HTTP:** Admin POSTs to **`{DEMO_GENERATOR_URL}{DEMO_GENERATOR_ASYNC_PATH}`** (default **`/api/create-async`** for Stitch; set **`DEMO_GENERATOR_ASYNC_PATH=/api/dental-async`** for the classic Website Template service). See `getDemoGeneratorEndpoint` in `processDemoJob.ts`.
- **Callback:** Website Template POSTs to **`/api/demo/generation-callback`** with **`Authorization: Bearer <DEMO_CALLBACK_SECRET>`**; Admin updates prospect demo link, storage, and job status.

Free-tier and some inline flows may use **Claude** HTML generation in-app (`$lib/server` demo helpers) without the external service; see README and PRD for env matrix.

---

## 2. Lib structure

### 2.1 Public API (use these in routes and components)

- **`$lib/demo`** — Demo status (draft/sent/replied), themes (v1.3), tracking helpers, types (`DemoAudit`, `DemoLandingContent`, `DemoPageJson`), `auditFromScrapedData`, `trackDemoEvent`. Use for any UI or shared logic that touches demo state or types.
- **`$lib/insights`** — Types and helpers for AI insights: `GeminiInsight`, `WebsiteInsight`, `AuditModalCopy`, `hasUsableInsight`. Use in components that display or check insight data.
- **`$lib/server/demo`** — Server-only demo: `processOneDemoJob`, page.json builders, storage, landing content, images (Pexels primary, Unsplash fallback), free-demo cookie/prospect. Use in `+page.server.ts`, API routes, and other server code that creates or serves demos.
- **`$lib/server/insights`** — Server-only insight generation: `generateInsightForProspect`, `generateAuditModalCopy`, `inferIndustryWithGemini`. Use when you need to run or re-run AI insight (e.g. “Pull insights”, demo job).

### 2.2 Source of truth (internal)

Types and constants are defined once; the barrels above re-export them. Prefer importing from the barrels in **routes and components**. Internal server modules (e.g. `generateAudit`, `gbp`, `demoPageJson`) may still import from:

- `$lib/types/demo`, `$lib/types/demoPageJson` — type definitions.
- `$lib/constants/demoStatus` — status constants.
- `$lib/demoThemes` — theme mapping and layout.

This keeps a single source of truth and avoids circular dependencies.

### 2.3 Other lib areas

- **`$lib/components/ui/*`** — shadcn-svelte UI (dashboard only; not used on landing or demo pages).
- **`$lib/industries`**, **`$lib/tones`**, **`$lib/content/*`** — industries, tones, and static content for demos.
- **`$lib/constants`** — app-wide constants (e.g. company name, legal).
- **`$lib/plans`** — plan tiers and limits (used by layout and billing).

---

## 3. Key flows

### Qualifying (GBP) → Generate demo (dashboard / paid path)

1. **Qualifying (GBP)** runs (cron or user action): fetches GBP via Places, stores **`scraped_data`** on the prospect / `demo_tracking`, runs insights as configured.
2. User clicks **Generate demo** → a **`demo_jobs`** row is processed; **`processOneDemoJob`** uses **only** existing scraped data. If none is present, the job fails until qualifying completes.
3. **Paid path:** Payload is built (`transformToWebsiteTemplatePayload`), sent to **Website Template** async endpoint; on callback, demo URL and artifacts are persisted. **Legacy / alternate:** some demos still use page JSON + Svelte industry templates or Claude HTML in storage; the PRD describes convergence on generated HTML where applicable.

### Send email

1. Prospect has a demo and status **Approved**; user has Resend (or Gmail) configured.
2. **Send** engine builds subject/body from templates and user settings, then sends via Resend or Gmail. Status moves to **Sent**; `demo_tracking.send_time` is set.

---

## 4. Internal / ednsy.com-only

- **AI Agent Page** (`/dashboard/agents`) — Editable agents are **Email AI Agent**, **GBP AI Agent**, and **Demo AI Agent (chat)**. Access is restricted to `@ednsy.com` users (`isEdnsyUser` in `$lib/plans`). Prompts are stored in `agent_content_versions`; the app uses the default from code until an override is saved. Resolver: `$lib/server/agentContent` (`getResolvedContent`, `saveAgentContent`). Design and Demo Creation are no longer shown on the dashboard but existing DB overrides for those agents are still resolved when used by `generateTone` and `generateAudit`.

---

## 5. Related docs

- [PRD](prd.md) — product scope and requirements.
- [API conventions](api-conventions.md) — `/api/*` patterns, cron and Stripe auth.
- [Demo payload → Website Template](demo-payload-website-template.md) — JSON contract for the generator service.
- [Next steps (first send)](next-steps-first-send.md) — checklist for sending the first email.
- [Integrations](integrations/) — HubSpot, GoHighLevel, Pipedrive, Notion.
- [VERSION.md](VERSION.md) — versioning policy.
- [CHANGELOG.md](CHANGELOG.md) — release history.
- [README](../README.md) — env vars, migrations list, route map.
