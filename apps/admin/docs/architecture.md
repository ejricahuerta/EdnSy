# Ed & Sy Admin App — Architecture

This document describes the **core engines** of the app and how the **lib** is organized. Use it when onboarding, refactoring, or adding features.

**Last updated:** March 2026

---

## 1. Core Engines

The app is built around these functional areas. Each has a clear responsibility and maps to specific `$lib` modules.

| Engine | Responsibility | Lib entry points |
|--------|----------------|------------------|
| **Demo** | Build, store, and serve personalized demo pages (themes, page.json, tracking, free-demo flow). | `$lib/demo`, `$lib/server/demo` |
| **Insights** | AI-generated business assessment (grade, summary, recommendations, audit modal copy, industry inference). | `$lib/insights`, `$lib/server/insights` |
| **GBP** | Google Business Profile data: fetch via DataForSEO, shape scraped data for demos and audit. | `$lib/server/gbp` |
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

### Qualifying (GBP) → Generate demo

1. **Qualifying (GBP)** runs (cron or user action): fetches GBP, grades with AI, stores `scraped_data` in `demo_tracking` and moves prospect to "Generate Demo".
2. User clicks **Generate demo** → a job is enqueued; `processOneDemoJob` runs. It uses **only** existing `scraped_data` from the qualifying step. If none is present, the job fails with "Complete the qualifying (GBP) step first."
3. Demo job builds page.json (theme, landing content, images), uploads to storage, updates prospect `demoLink` and `demo_tracking`.

### Send email

1. Prospect has a demo and status **Approved**; user has Resend (or Gmail) configured.
2. **Send** engine builds subject/body from templates and user settings, then sends via Resend or Gmail. Status moves to **Sent**; `demo_tracking.send_time` is set.

---

## 4. Internal / ednsy.com-only

- **AI Agent Page** (`/dashboard/agents`) — Editable agents are **Email AI Agent**, **GBP AI Agent**, and **Demo AI Agent (chat)**. Access is restricted to `@ednsy.com` users (`isEdnsyUser` in `$lib/plans`). Prompts are stored in `agent_content_versions`; the app uses the default from code until an override is saved. Resolver: `$lib/server/agentContent` (`getResolvedContent`, `saveAgentContent`). Design and Demo Creation are no longer shown on the dashboard but existing DB overrides for those agents are still resolved when used by `generateTone` and `generateAudit`.

---

## 5. Related docs

- [PRD](prd.md) — product scope and requirements.
- [Next steps (first send)](next-steps-first-send.md) — checklist for sending the first email.
- [Integrations](integrations/) — HubSpot, GoHighLevel, Pipedrive, Notion.
- [VERSION.md](VERSION.md) — versioning policy.
