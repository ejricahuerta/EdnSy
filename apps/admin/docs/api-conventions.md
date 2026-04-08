# API Conventions (REST)

All JSON APIs under `/api` follow these conventions. Use them when adding or changing endpoints and when assigning agents to capabilities.

## Error responses

- **Shape:** `{ error: string, code?: string }`
- **HTTP status:** 401 (auth), 400 (validation), 404 (not found), 429 (rate limit), 502/503 (server or config)
- **Content-Type:** `application/json`

Use the shared helper: `apiError(status, message, code?)` from `$lib/server/apiResponse`.

## Success responses

- **Shape:** Resource-shaped body (e.g. `{ overview: {...} }`, `{ job: {...} }`, `{ content }`). No single global envelope; each endpoint returns a consistent shape for its resource.
- **HTTP status:** 200 for success
- Use `apiSuccess(data)` from `$lib/server/apiResponse`

## Endpoint list (resource-oriented)

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| POST | `/api/chat` | Landing chat (Gemini) | Cookie (optional) |
| POST | `/api/chat/crm` | Dashboard CRM chat (Gemini) | Session |
| GET | `/api/demo/click` | Track click, redirect to demo URL | None (query `p=`) |
| GET | `/api/demo/open` | Open pixel (record open, return 1x1 GIF) | None |
| POST | `/api/demo/track` | Demo events (page_view, time_on_page_2min, etc.) | None |
| POST | `/api/demo/callback` | Retell callback (schedule call) | None |
| POST | `/api/demo/generation-callback` | Demo generator completion (website-template → admin) | DEMO_CALLBACK_SECRET (Bearer) |
| POST | `/api/demo/lead` | Lead capture from Stitch demo hero form (form POST or JSON) | None (rate limited) |
| GET | `/api/demo/[slug]/page.json` | Get v1.3 page JSON for demo | None |
| POST | `/api/dashboard/overview` | (Re)generate AI dashboard overview | Session |
| GET | `/api/dashboard/integrations/credentials/[provider]` | Get CRM credentials for provider | Session |
| POST | `/api/jobs/demo` | Process one demo job (paid then free) | Session |
| POST | `/api/jobs/gbp` | Process one GBP job | Session |
| POST | `/api/jobs/insights` | Process one insights job | Session |
| GET | `/api/cron/jobs/demo` | Cron: process one demo job | CRON_SECRET (Bearer) |
| GET | `/api/cron/jobs/gbp` | Cron: process GBP jobs (batch) | CRON_SECRET (Bearer) |
| POST | `/api/stripe/checkout` | Create Stripe checkout session | Session |
| POST | `/api/stripe/portal` | Create Stripe customer portal session | Session |
| POST | `/api/stripe/webhook` | Stripe webhook | Stripe signature |

## Naming and methods

- **Resources:** Use nouns in the path (e.g. `/api/jobs/demo`, `/api/dashboard/overview`). Avoid verbs in the URL (no `/process-demo-job`, no `/overview/refresh`).
- **HTTP method:** POST for create/run, GET for read. Cron endpoints use GET (Vercel convention) and are secured by `CRON_SECRET`.

## Reference

- Response helpers: `$lib/server/apiResponse.ts` (`apiError`, `apiSuccess`)
- Plan: REST API cleanup and agent assignment (see project plan docs)
