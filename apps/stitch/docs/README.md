# Stitch app documentation

Documentation for the **Stitch** Next.js app in this monorepo (`apps/stitch`). This app is for **generating landing page HTML** using Google Stitch and its SDK. Add design notes, integration guides, and runbooks here as the app grows.

## What this app is

- **Goal:** Accept a **JSON payload** of business and marketing content, turn it into a Stitch prompt (or structured generation request), and produce **landing page HTML** (and related assets) to use or ship from this app.

### Input payload (JSON)

The app expects structured input (for example from an API request or internal tool) that mixes **business data** and **page copy**. Typical fields include:

| Area | Examples |
|------|----------|
| **Business** | Name, tagline, contact info, address, **hours**, service area |
| **Offerings** | **Services** (or products), categories, pricing notes |
| **Social proof** | **Testimonials**, reviews, logos, awards |
| **About** | **Info** / story, team, differentiators |
| **Marketing copy** | **Heading**, **subheading** (sub), **CTA** labels, section titles, footer text |

The payload is turned into a Stitch text prompt by [`lib/prompts/landing-page.ts`](../lib/prompts/landing-page.ts) (`LandingPageContext`, `buildLandingPagePrompt`). The POST body should be a JSON object (any subset of that shape is allowed).

**Ed & Sy Admin** sends a **`WebsiteTemplatePayload`** for paid demos. Website Template uses **`POST /api/dental-async`**; Stitch can replace it with **`POST /api/create-async`** (async + Supabase upload + callback). See [`apps/admin/docs/demo-payload-website-template.md`](../../admin/docs/demo-payload-website-template.md); a sample payload lives in [`references/sample-admin-demo-payload.json`](./references/sample-admin-demo-payload.json). Configure admin with **`DEMO_GENERATOR_URL`** (Stitch origin) and **`DEMO_GENERATOR_ASYNC_PATH=/api/create-async`**.

### REST: `POST /api/create-async` (Admin demo generator)

**Alias:** **`POST /api/dental-async`** uses the same handler so admin’s default `DEMO_GENERATOR_ASYNC_PATH` (`/api/dental-async`) works when `DEMO_GENERATOR_URL` points at this app.

Industry-agnostic async endpoint matching Website Template’s **`/api/dental-async`** contract:

- **Auth:** `Authorization: Bearer <DEMO_GENERATOR_API_KEY>` (same secret admin sends; optional alias `STITCH_DEMO_GENERATOR_API_KEY` on Stitch). If neither env is set, requests are allowed (local dev parity with website-template).
- **Body:** JSON with required **`jobId`**, **`prospectId`**, **`callbackUrl`**, **`callbackToken`**, optional **`userId`**, plus **WebsiteTemplate-shaped** fields (business, hero, services, …). Meta fields are stripped before building the Stitch prompt ([`lib/map-website-template-to-landing-context.ts`](../lib/map-website-template-to-landing-context.ts)).
- **Response:** **202** `{ "id": "<jobId>", "status": "accepted" }` immediately.
- **After 202:** Stitch generates HTML (runs inside Next.js [`after()`](https://nextjs.org/docs/app/api-reference/functions/after)), optionally uploads **`demo-html/{prospectId}.html`** when Supabase env is set (failure is logged only), then **`POST`s** `callbackUrl` with `Authorization: Bearer <callbackToken>` and JSON **`{ jobId, prospectId, userId?, html }`** so admin’s **`uploadDemoHtml`** always runs (same as website-template). On failure before HTML exists, callback includes **`error`**.
- **Route segment:** `maxDuration` is **300** seconds for long Stitch runs. Restrict **`callbackUrl`** with **`ALLOWED_CALLBACK_ORIGINS`** if needed ([`lib/stitch/callback-url.ts`](../lib/stitch/callback-url.ts)).

### REST: `POST /create`

- **URL:** `POST /create` (same origin as the dev server, e.g. `http://localhost:3000/create`).
- **Body:** JSON object matching `LandingPageContext` (see types in `lib/prompts/landing-page.ts`).
- **Response:** JSON with `projectId`, `screenId`, `htmlUrl` (Stitch HTML download URL). When the server can fetch that URL anonymously, `html` is also included with the raw HTML string.
- **Errors:** Stitch failures return JSON `{ error, code }` with HTTP status derived from the SDK (`AUTH_FAILED` → 401, `RATE_LIMITED` → 429, etc.). If the app’s **daily generation quota** is exhausted, responses use **429** with `code: "DAILY_QUOTA_EXCEEDED"` and `limit` / `used` (see below).

### Test APIs (`/api/test`)

Experimental and fixture-driven routes belong under **`/api/test`**. Add new test handlers under `app/api/test/` (e.g. `app/api/test/foo/route.ts` → `POST /api/test/foo`).

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/test/samples` | Lists test payload ids, labels, and filenames (no large JSON bodies). |
| `POST` | `/api/test` | Stitch run using [`references/landing-page-prompt-one-liner.txt`](./references/landing-page-prompt-one-liner.txt) plus one **WebsiteTemplate-shaped** JSON from [`lib/test/test-samples-registry.ts`](../lib/test/test-samples-registry.ts). Optional body: `{ "sampleId": "downtown-dental" }`. Omit body or omit `sampleId` to **pick a random** sample. Response adds `sampleId`, `sampleLabel`, and `source` (file + one-liner). |

Payload JSON and the shared one-liner live in **`docs/references/`**: [`sample-admin-demo-payload.json`](./references/sample-admin-demo-payload.json) (dental), [`sample-test-cafe.json`](./references/sample-test-cafe.json), [`sample-test-fitness.json`](./references/sample-test-fitness.json), [`sample-test-legal.json`](./references/sample-test-legal.json). Register new files in the registry.

```bash
curl -s http://localhost:3000/api/test/samples
curl -s -X POST http://localhost:3000/api/test
curl -s -X POST http://localhost:3000/api/test -H "Content-Type: application/json" -d "{\"sampleId\":\"riverside-cafe\"}"
```

**UI:** [`/test`](../app/test/page.tsx) loads the sample list, **Random sample each run** (default), optional fixed payload dropdown, **Run test**, and iframe preview.

### Environment variables

Place **`STITCH_API_KEY`** in **`.env.local`** in the `apps/stitch` project root (recommended). The Stitch bootstrap also loads **`app/.env`** if you keep secrets there, but root env files override `app/.env` when both set the same variable. See [`.env.example`](../.env.example).

| Variable | Required | Description |
|----------|----------|-------------|
| `STITCH_API_KEY` | Yes | API key for `@google/stitch-sdk` |
| `STITCH_LAUNCH_ROSETTA_PROJECT_ID` | No | Bare Stitch project id to use instead of listing projects by title |
| `STITCH_DAILY_GENERATION_LIMIT` | No | Max **successful** Stitch generations per **UTC calendar day** across `POST /create`, `POST /api/test`, and **`POST /api/create-async`** (default **100**). Set **`0`** to turn off enforcement. |
| `STITCH_DAILY_GENERATION_STATE_FILE` | No | Path to the JSON file that stores today’s count (default: **`.stitch/daily-generation-state.json`** under the process cwd). Useful for tests or a persistent disk in serverless. |
| `DEMO_GENERATOR_API_KEY` or `STITCH_DEMO_GENERATOR_API_KEY` | For `/api/create-async` | Bearer token for the async demo route (match admin’s `DEMO_GENERATOR_API_KEY`). |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | For `/api/create-async` | Service role upload to **`demo-html/{prospectId}.html`**. |
| `DEMO_HTML_BUCKET` | No | Storage bucket (default **`admin-ednsy-bucket`**). |
| `ALLOWED_CALLBACK_ORIGINS` | No | Comma-separated allowed origins for `callbackUrl` (optional). |

### Daily generation quota (100/day)

The Stitch product quota is **100 generations per day** (per Google’s plan for this key). This app enforces a matching cap so you do not burn the remote quota accidentally: each **successful** generation increments a counter for the current **UTC** date. Failed Stitch calls **do not** count; the counter is rolled back if generation throws.

State is stored in a **local file** by default (see `.gitignore` for `.stitch/`). On platforms where the filesystem is ephemeral or shared across many instances, counts are **per instance** and not a global cap; use a single long-running Node process, or set `STITCH_DAILY_GENERATION_STATE_FILE` to shared storage, or rely on Stitch’s own `RATE_LIMITED` responses when you need a hard global limit.

### Launch Rosetta project

On **Node server startup**, the app ensures a Stitch project titled **Launch Rosetta** exists (`list_projects`, then `create_project` if missing). Logic lives in [`lib/stitch/launch-rosetta.ts`](../lib/stitch/launch-rosetta.ts) and runs from [`instrumentation.ts`](../instrumentation.ts). Screens from `POST /create` are generated in that project.

Screen generation uses **Gemini 3.1 Pro** via the Stitch SDK (`GEMINI_3_1_PRO` in [`lib/stitch/generate-screen-html.ts`](../lib/stitch/generate-screen-html.ts)).

- **Official Stitch docs:** [Stitch documentation](https://stitch.withgoogle.com/docs) (API, concepts, and SDK usage).
- **SDK:** [`@google/stitch-sdk`](https://github.com/google-labs-code/stitch-sdk) (see the repo README for setup). Set `STITCH_API_KEY` for API access unless your deployment uses another supported configuration from the docs.
- **Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4

## Local development

From `apps/stitch`:

```bash
cp .env.example .env.local
# set STITCH_API_KEY in .env.local

pnpm install   # or npm install / yarn
pnpm dev       # or npm run dev
```

Example request after the server is up:

```bash
curl -s -X POST http://localhost:3000/create \
  -H "Content-Type: application/json" \
  -d "{\"marketing\":{\"heading\":\"Hello\",\"ctaPrimary\":\"Get started\"}}"
```

Other scripts: `build`, `start`, `lint`, **`test`** (`vitest run`), **`test:watch`** (see `package.json`). Tests live in [`tests/`](../tests/) (for example [`tests/api-test-route.test.ts`](../tests/api-test-route.test.ts) for `POST /api/test`).

## Related files

- **Agent / tooling notes for this app:** [`../AGENTS.md`](../AGENTS.md) (Next.js version and conventions)
- **App entry:** `app/layout.tsx`, `app/page.tsx`, `app/test/page.tsx` (Stitch test preview UI)
- **API routes:** `app/create/route.ts`, `app/api/create-async/route.ts`, `app/api/test/route.ts`, `app/api/test/samples/route.ts`
- **Test fixtures:** `lib/test/test-samples-registry.ts`, `lib/test/build-test-prompt.ts`, `docs/references/*`
- **Stitch bootstrap:** `instrumentation.ts`, `lib/stitch/bootstrap-node.ts`, `lib/stitch/launch-rosetta.ts`
- **Tests:** `vitest.config.ts`, `tests/api-test-route.test.ts`

## Contributing to these docs

Keep filenames lowercase with hyphens where it helps (for example `stitch-sdk-setup.md`). Prefer [stitch.withgoogle.com/docs](https://stitch.withgoogle.com/docs) and the SDK repo for API details; only duplicate EdnSy-specific steps here.
