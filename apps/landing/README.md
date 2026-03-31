# Ed & Sy — Marketing site (`apps/landing`)

Public marketing website for Ed & Sy: services, local SEO landing pages, case studies, blog, and contact. Built with **SvelteKit 5**, **TypeScript**, and **Tailwind CSS v4**. PostHog is available for analytics when configured.

This app is **not** the Ed & Sy Admin product (`apps/admin`). Admin handles demos, dashboard, and billing.

## Main routes

- `/` — Homepage
- `/services`, `/about`, `/process`, `/team`, `/contact`
- `/industries`, `/industries/[slug]`
- `/case-studies`, `/case-studies/[slug]`
- `/blog`, `/blog/*`
- Service and SEO pages such as `/voice-ai-for-business`, `/business-automation-services`, `/website-design-toronto`, and Toronto/GTA-focused URLs

## Setup

```bash
cd apps/landing
pnpm install
pnpm dev
```

## Environment

Create `.env` as needed for **PostHog** or other integrations your deployment uses. `@supabase/supabase-js` is listed as a dependency for optional future use; there is no active Supabase client wiring in routes at this snapshot (see `src/routes/+layout.server.ts`).

## Tasks

Product tasks for this site are in [tasks/tasks.json](tasks/tasks.json). The PRD for positioning is [PRD.md](PRD.md).

## Related

- **Admin app:** `../admin` — Lead Rosetta / Ed & Sy Admin product
- **Monorepo root:** see root `package.json` for workspace scripts
