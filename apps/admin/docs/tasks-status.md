# Lead Rosetta — Tasks vs Implementation Status

**Last updated:** April 2026  
**Source of truth:** `tasks/tasks.json` + PRD `docs/prd.md`

This doc summarizes what’s implemented, what’s pending, what’s not needed (or deferred), and which docs need refreshing.

---

## 1. Summary

| Status        | Count | Notes |
|---------------|-------|--------|
| **Done**      | 19    | Includes Stripe (17), Gmail outreach, Realtime, Places-backed GBP (see table below) |
| **In progress** | 0   | — |
| **Pending**   | 6     | F2 AI mapping, F6 refresh, F7 checklist, onboarding, compliance (24), CRM reply sync stretch (18) |
| **Not needed / deferred** | 0 | — |

**Doc refresh (April 2026):** PRD and `docs/architecture.md` updated for **Google Places** (not DataForSEO) as live GBP source, **Gmail-only** sends (Resend removed from live path), **Stripe** live, **`email_draft`** status, **Supabase Realtime** on prospects/job tables, demo host **`built.by.ednsy.com`**.

---

## 2. Implemented (Done in Code)

These match `tasks.json` “done” or are implemented but were still marked pending; they’re aligned with the PRD.

| Id | Title | Notes |
|----|--------|--------|
| 1 | Landing page and lead-rosetta site | `/`, hero, pricing, CTAs, style guide. |
| 2 | Free tier flow | Cookie limits (`/upload` where enabled); `/try` removed (redirect to sign-in). |
| 3 | Free tier monthly limit | `getFreeBriefingsState`, at-limit UX, sign-in CTA. |
| 4 | Industry demo pages | `/{industry}/[id]`, templates, prospect from CRM or cookie. |
| 5 | Design system and style guides | Style guides + industry themes; shadcn only in dashboard. |
| 6 | CSV upload and parsing | `/upload`, column mapping, free first row; redirect to demo. |
| 7 | Dashboard and prospects | **Implementation:** Prospects in **Supabase**; CRMs (Notion, HubSpot, GHL, Pipedrive) sync into dashboard. Task text said “from Notion” — now “from connected CRM or manual (Add test client)”. |
| 8 | Auth (Google OAuth) | `/auth/login`, Google OAuth, session, dashboard protected. |
| 9 | Privacy and Terms pages | `/terms`, `/privacy`, linked from landing footer. |
| 10 | Demo view tracking API | `/api/demo/track`, open/click; used for F5. |
| 11 | F1 — Demo generation (GBP-first) | **Live:** Google Places → `scraped_data`; paid demos via website-template async + Claude paths; &lt;90s target. Task title still says DataForSEO; implementation is Places-first. |
| 13 | F3 — Review and approve queue | Confidence visible, approve gate, disclaimer, statuses incl. **`email_draft`**, bulk approve, Gmail draft/send. |
| 14 | F4 — Email template suite | Cold, follow-up, SMS copy-ready; **Gmail** draft + `drafts.send` from dashboard when connected; Resend not used for live send. |
| 15 | F5 — Demo intelligence dashboard | Viewed, time on page, return visits, hot lead (2+ min); notifications. |
| 16 | Pro tier enforcement and plans | Starter 30, Pro 100, Agency unlimited; `getDemoCreationLimit`; `canSendAutomated` true for **Starter, Pro, Agency** (Gmail outreach). |
| 19 | F1a — Data confidence scoring | `computeDataConfidenceScore` in `lib/types/demo.ts`; AuditModal; `LowDataView`; block below 50. |
| 20 | F1b — Pain modal and sticky CTA | `AuditModal.svelte`, sticky header/CTA on demo pages. |
| 25 | Agency tier: Contact us CTA | Landing Agency card → mailto (see live pricing for amount). |
| — | **Supabase Realtime** | Dashboard listens on `prospects`, `demo_jobs`, `gbp_jobs`, `insights_jobs` (`user_id` filter). |
| — | **Stripe** | Checkout, webhook, portal; `getPlanForUser`. |

**Compliance (partial):** Unsubscribe link text is on every demo page footer (`/unsubscribe?prospect=...`). There is **no `/unsubscribe` route** yet (landing page only or 404). Task 24 remains “pending” until signup checkbox (ToS/AUP) and unsubscribe **handler** are in place.

---

## 3. In Progress

None — Stripe (task 17) is **done** in `tasks.json`.

---

## 4. Pending (Not Yet Implemented)

| Id | Title | Notes |
|----|--------|--------|
| 12 | F2 — CSV upload with AI mapping | AI maps headers → Lead Rosetta fields; user confirm; auto-clean; preview counts. |
| 21 | F6 — On-demand data refresh | “Last scraped” per lead; one-click re-fetch (Places / future provider); demo regenerates. |
| 22 | F7 — Deliverability pre-send checklist | Checklist before send (warmup, SPF/DKIM, volume, spam words); skip = warning. |
| 23 | 3-step onboarding flow | Welcome → sample demo → first real demo sent; first demo sent = activated. |
| 24 | Compliance: ToS, signup checkbox, unsubscribe link | Checkbox on signup; ToS/Privacy (Termly.io or existing); **unsubscribe route** for `/unsubscribe?prospect=...` (link exists on demos; handler missing). |
| 18 | CRM connectors (Pro v1.1) | Notion already connected; HubSpot, GHL, Pipedrive in integrations; “reply sync” optional. Low priority / stretch. |

---

## 5. Not Needed / Deferred

- **Task 18 (CRM):** Notion + others already in app; PRD says CRM is Pro stretch. No change to “not needed”; keep as low-priority pending if reply sync is desired later.

---

## 6. Docs to Refresh

| Doc | Action |
|-----|--------|
| **README.md** | Add missing migrations: `20260302120000_demo_events.sql`, `20260303100000_consolidated_prospects_user_settings_crm_flagged.sql` in chronological order. **Done.** |
| **tasks/tasks.json** | Set status to `done` for tasks 19 (F1a), 20 (F1b), 25 (Agency CTA). **Done.** |
| **Task 7 description** | Optional: change “prospects from Notion” to “prospects from connected CRM or manual (Supabase-backed)” for accuracy. |
| **docs/next-steps-first-send.md** | Rewritten April 2026: Gmail-first prerequisites, draft + Send now flow, copy-only path. |
| **docs/VERSION.md** | Already describes v1.0.0 baseline and first-send milestone. No change. |
| **PRD Section 12 Pre-Launch Checklist** | Updated April 2026: Places-backed GBP ✅, Stripe ✅, F1a ✅, F1b ✅, F3 ✅, F4 ✅, disclaimer ✅, F7 ⬜, onboarding ⬜, ToS/Privacy ✅, signup checkbox ⬜, unsubscribe (handler ⬜), Agency Contact us ✅. |

---

## 7. Quick Reference: Routes and Features

- **Landing:** `/` — hero, pricing (Free / Starter / Pro / Agency with Contact us), CTAs.
- **Free demos:** Cookie-based limits on `/upload` where applicable; legacy `/try` redirects to `/auth/login`.
- **Upload:** `/upload` — CSV, first row free; redirect to demo.
- **Auth:** `/auth/login`, `/auth/google`, `/auth/logout`.
- **Dashboard:** `/dashboard` (overview), `/dashboard/prospects` (Prospects — table, create demo, approve, send; `/dashboard/clients` redirects here), `/dashboard/prospects/[id]` (prospect detail), `/dashboard/integrations`, `/dashboard/billing`, `/dashboard/settings`, etc.
- **Demos:** `/construction/[id]`, `/healthcare/[id]`, `/dental/[id]`, etc. — AuditModal (pain modal), sticky header, CTA strip, unsubscribe link in footer (no `/unsubscribe` route yet).
- **Legal:** `/terms`, `/privacy`, `/aup`, `/cookies`, `/dpa`, `/security`.

---

*Ed & Sy Inc. — Lead Rosetta. Tasks status doc.*
