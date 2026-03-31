# Website Template — Architecture

**Service:** Standalone **Node.js** app (`apps/website-template`) that produces **single-file HTML** landing pages from structured business JSON (`index.json` shape). It runs as a **CLI** and as an **HTTP API** (Express).

**Last updated:** March 2026

---

## Purpose in the monorepo

**Ed & Sy Admin** (`apps/admin`) enqueues paid demo jobs and, when **`DEMO_GENERATOR_URL`** / **`DEMO_GENERATOR_API_KEY`** / **`DEMO_CALLBACK_SECRET`** are set, POSTs to this service’s **async** endpoints. The generator runs work in the background and **callbacks** to Admin at **`/api/demo/generation-callback`**. Payload contract: [apps/admin/docs/demo-payload-website-template.md](../../admin/docs/demo-payload-website-template.md).

---

## Technology stack

| Component | Role |
|-----------|------|
| **Node.js** ≥ 20 | Runtime |
| **Express** (`server.js`) | HTTP API, OpenAPI UI, auth middleware |
| **Anthropic SDK** (`generate.js`) | Claude for branding → plan → full HTML (sync and async generate paths) |
| **@supabase/supabase-js** | Optional upload of generated HTML to Storage (`admin-ednsy-bucket` / `demo-html/`) |
| **swagger-ui-express** + `openapi.json` | `/api-docs`, `/api/openapi.json` |
| **Renderer** (`renderer/*`) | **Deterministic HTML** for dental (and related) styles — no LLM: `renderPage`, style variants `dental-v1` … `dental-v6`, health/wellness helpers, obfuscation, map utilities |

No frontend build: output is static HTML.

---

## Two generation modes

### 1. Claude pipeline (AI HTML)

Used by **`POST /api/generate`** (sync) and **`POST /api/generate-async`** (202 + callback).

1. Optional **branding** phase (`prompts/branding-prompt.md` + business JSON) → structured branding spec.
2. Optional **plan** phase (`prompts/plan-prompt.md`) → section list and layout intent.
3. **Generate** phase (`prompts/prompt.md`) → streaming Claude output → single **`index.html`** string.

CLI **`node generate.js`** follows the same pipeline and writes to disk (and optional Supabase upload).

### 2. Dental template renderer (deterministic)

Used by **`POST /api/dental`** (sync) and **`POST /api/dental-async`** (202 + callback).

- **`renderer/renderPage.js`** and **`renderer/sections/dental-v*.js`** assemble HTML from JSON with a **random or requested style** (`dental-v1` … `dental-v6`).
- **Admin currently calls `/api/dental-async` for all paid demo jobs** (see `getDemoGeneratorEndpoint` in Admin’s `processDemoJob.ts`). The AI **`/api/generate-async`** path remains available for other callers or future routing.

---

## HTTP server layout (`server.js`)

- **`requireApiKey`** — If **`DEMO_GENERATOR_API_KEY`** or **`WEBSITE_TEMPLATE_API_KEY`** is set, `POST` routes require `Authorization: Bearer <key>`.
- **Callback validation** — Async routes check **`callbackUrl`** (HTTPS, or HTTP on loopback); optional **`ALLOWED_CALLBACK_ORIGINS`** allowlist.
- **Strip meta fields** — `jobId`, `prospectId`, `callbackUrl`, etc. are removed before passing data to generators (see server helper around “Strip meta”).

Endpoints are documented in the root [README](../README.md) and in **`openapi.json`**.

---

## File layout (high level)

| Path | Purpose |
|------|---------|
| `generate.js` | CLI + shared `generate()` for API (Claude phases, file write, Supabase upload) |
| `server.js` | Express app, routes, OpenAPI |
| `prompts/*.md` | Branding, plan, and main generation prompts |
| `renderer/` | Dental (and health/wellness) deterministic rendering, CSS loading, icons, obfuscation |
| `index.json` | Reference business payload for local runs |

---

## Security and operations

- **Secrets:** `CLAUDE_API_KEY` / `ANTHROPIC_API_KEY`, Supabase service role for upload, API key for POST routes.
- **SSRF:** Callback URL rules + optional origin allowlist (see README).
- **Debug:** `DEBUG=1` or `DEBUG=website-template` for verbose logs.

---

## Related

- [README](../README.md) — setup, curl examples, env vars.
- [Admin architecture](../../admin/docs/architecture.md) — how Admin invokes this service and handles callbacks.
