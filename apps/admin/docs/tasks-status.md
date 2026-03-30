# Lead Rosetta — Tasks vs Implementation Status

**Last updated:** March 2026  
**Source of truth:** `tasks/tasks.json` + PRD `docs/prd.md`

This doc summarizes what’s implemented, what’s pending, what’s not needed (or deferred), and which docs need refreshing.

---

## 1. Summary

| Status        | Count | Notes |
|---------------|-------|--------|
| **Done**      | 18    | Implemented and aligned with PRD |
| **In progress** | 1   | Stripe (17) |
| **Pending**   | 6     | F2 AI mapping, F6 refresh, F7 checklist, onboarding, compliance signup, (25 done in code) |
| **Not needed / deferred** | 0 | — |

**Doc refresh:** README migrations list was missing two migrations (added). Task 7 description said “Notion” but implementation is Supabase-backed prospects with CRM sync (Notion, HubSpot, etc.); task text is legacy.

---

## 2. Implemented (Done in Code)

These match `tasks.json` “done” or are implemented but were still marked pending; they’re aligned with the PRD.

| Id | Title | Notes |
|----|--------|--------|
| 1 | Landing page and lead-rosetta site | `/`, hero, pricing, CTAs, style guide. |
| 2 | Free tier Try flow | `/try`, one demo, no account, cookie-based. |
| 3 | Free tier monthly limit | `getFreeBriefingsState`, at-limit UX, sign-in CTA. |
| 4 | Industry demo pages | `/{industry}/[id]`, templates, prospect from CRM or cookie. |
| 5 | Design system and style guides | Style guides + industry themes; shadcn only in dashboard. |
| 6 | CSV upload and parsing | `/upload`, column mapping, free first row; redirect to demo. |
| 7 | Dashboard and prospects | **Implementation:** Prospects in **Supabase**; CRMs (Notion, HubSpot, GHL, Pipedrive) sync into dashboard. Task text said “from Notion” — now “from connected CRM or manual (Add test client)”. |
| 8 | Auth (Google OAuth) | `/auth/login`, Google OAuth, session, dashboard protected. |
| 9 | Privacy and Terms pages | `/terms`, `/privacy`, linked from try and footer. |
| 10 | Demo view tracking API | `/api/demo/track`, open/click; used for F5. |
| 11 | F1 — Demo generation (GBP-first) | DataForSEO + ScrapingBee, cache, &lt;90s target. |
| 13 | F3 — Review and approve queue | Confidence visible, approve gate, disclaimer, statuses, bulk approve, send. |
| 14 | F4 — Email template suite | Cold, follow-up, SMS; Resend for send; templates copy-ready. |
| 15 | F5 — Demo intelligence dashboard | Viewed, time on page, return visits, hot lead (2+ min); notifications. |
| 16 | Pro tier enforcement and plans | Starter 30, Pro 100, Agency unlimited; `getDemoCreationLimit`, `canSendAutomated`. |
| **19** | **F1a — Data confidence scoring** | **Implemented:** `computeDataConfidenceScore` in `lib/types/demo.ts`; AuditModal shows “X% complete — high/medium confidence”; `LowDataView` for &lt;50; block generation below 50. **Recommend:** Mark task 19 **done**. |
| **20** | **F1b — Pain modal and sticky CTA** | **Implemented:** `AuditModal.svelte`: 1s delay, 4s force-read, session cookie `lr_demo_audit_seen`; red/amber/green (website, reviews, GBP, service pages); “See what it looks like fixed” CTA. Sticky header + CTA strip on demo pages. **Recommend:** Mark task 20 **done**. |
| **25** | **Agency tier: Contact us CTA** | **Implemented:** Landing pricing has Agency $299 with “Contact us” → `mailto:?subject=Lead%20Rosetta%20Agency%20plan`. **Recommend:** Mark task 25 **done**. |

**Compliance (partial):** Unsubscribe link text is on every demo page footer (`/unsubscribe?prospect=...`). There is **no `/unsubscribe` route** yet (landing page only or 404). Task 24 remains “pending” until signup checkbox (ToS/AUP) and unsubscribe **handler** are in place.

---

## 3. In Progress

| Id | Title | Notes |
|----|--------|--------|
| 17 | Stripe payments and Pro subscription | Checkout, webhook, `subscriptions` table; billing page. In progress. |

---

## 4. Pending (Not Yet Implemented)

| Id | Title | Notes |
|----|--------|--------|
| 12 | F2 — CSV upload with AI mapping | AI maps headers → Lead Rosetta fields; user confirm; auto-clean; preview counts. |
| 21 | F6 — On-demand data refresh | “Last scraped” per lead; one-click refresh via DataForSEO; demo regenerates. |
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
| **docs/next-steps-first-send.md** | Created; checklist for first send (Supabase, Resend, Prospects, approve, send). **Done.** |
| **docs/VERSION.md** | Already describes v1.0.0 baseline and first-send milestone. No change. |
| **PRD Section 12 Pre-Launch Checklist** | Can be updated to reflect: DataForSEO ✅, F1a ✅, F1b ✅, F3 ✅, F4 ✅, disclaimer ✅, F7 ⬜, onboarding ⬜, ToS/Privacy ✅, signup checkbox ⬜, unsubscribe link (text ✅, route ⬜), Agency Contact us ✅. |

---

## 7. Quick Reference: Routes and Features

- **Landing:** `/` — hero, pricing (Free / Starter / Pro / Agency with Contact us), CTAs.
- **Try:** `/try` — free demo, monthly limit, redirect to `/{industry}/[id]`.
- **Upload:** `/upload` — CSV, first row free; redirect to demo.
- **Auth:** `/auth/login`, `/auth/google`, `/auth/logout`.
- **Dashboard:** `/dashboard` (overview), `/dashboard/prospects` (Prospects — table, create demo, approve, send; `/dashboard/clients` redirects here), `/dashboard/prospects/[id]` (prospect detail), `/dashboard/integrations`, `/dashboard/billing`, `/dashboard/settings`, etc.
- **Demos:** `/construction/[id]`, `/healthcare/[id]`, `/dental/[id]`, etc. — AuditModal (pain modal), sticky header, CTA strip, unsubscribe link in footer (no `/unsubscribe` route yet).
- **Legal:** `/terms`, `/privacy`, `/aup`, `/cookies`, `/dpa`, `/security`.

---

*Ed & Sy Inc. — Lead Rosetta. Tasks status doc.*
