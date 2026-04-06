# Demo payload contract: Ed & Sy Admin to external demo generator

When Ed & Sy Admin creates a paid demo, it sends a structured JSON payload to the configured generator (Stitch or Website Template).

**Endpoint:** `processDemoJob` POSTs to **`{DEMO_GENERATOR_URL}{DEMO_GENERATOR_ASYNC_PATH}`**. Default **`DEMO_GENERATOR_ASYNC_PATH`** is **`/api/create-async`** (Stitch). For the classic Website Template Node service, set **`DEMO_GENERATOR_ASYNC_PATH=/api/dental-async`**. See `getDemoGeneratorEndpoint` in `src/lib/server/processDemoJob.ts`. The service responds **202** and later POSTs to the Admin **generation callback** (HTML may be pre-uploaded to storage when using Stitch).

**Future / alternate:** The Website Template app also exposes **`POST /api/generate-async`** (Claude branding → plan → full HTML). To route non-dental industries there again, extend `getDemoGeneratorEndpoint` (and keep payload/callback contracts aligned). See `apps/website-template/docs/architecture.md`.

The payload conforms to the **index.json** shape expected by Website Template so the generator can render the landing page correctly.

## Contract shape

The payload includes:

- **business** — name, tagline, description, phone, email, address, coordinates (optional), hours (Monday–Sunday), optional acceptingNewPatients (dental), optional social
- **hero** — headline, subheadline, cta (label, href), backgroundStyle
- **images** — hero, about, unsplashKeywords
- **services** — array of { name, description, coverage? } for dental or { name, description, price? } for others
- **insurance** — optional; for dental: { accepted, payment }
- **about** — headline, body, values
- **stats** — array of { value, label }
- **gallery** — optional array of image URLs
- **testimonials** — array of { author, quote, rating }
- **contact** — headline, showForm, showMap, mapEmbed, googleMapsApiKey
- **theme** — style, primaryColor, accentColor
- **seo** — title, description, keywords

Callback meta (stripped by Website Template before generation): `id`, `jobId`, `prospectId`, `userId`, `callbackUrl`, `callbackToken`.

## Reference files

The exact shape is aligned with these Website Template index files:

- `apps/website-template/index.json`
- `apps/website-template/index-dental-downtown.json`
- `apps/website-template/index-dental-riverside.json`

## Implementation

- **Type:** `WebsiteTemplatePayload` in `src/lib/types/websiteTemplatePayload.ts`
- **Builder:** `transformToWebsiteTemplatePayload()` in `src/lib/server/transformToWebsiteTemplatePayload.ts` converts built and enriched `LandingPageIndexJson` (from GBP + prospect + insight) into this shape, with hours normalized to day keys, dental-specific fields (coverage, insurance, acceptingNewPatients), and testimonials mapped to { author, quote, rating }.
- **Usage:** `processOneDemoJob` builds and enriches the landing JSON, then calls the transformer and sends the result plus callback meta to the external generator. Endpoint path is **`getDemoGeneratorEndpoint()`** in `processDemoJob.ts` (env **`DEMO_GENERATOR_ASYNC_PATH`**, default `/api/create-async`). To use Website Template’s **`/api/dental-async`** instead, set that env var.

Content that is missing from GBP and insights is filled with industry defaults and, where applicable, AI-generated copy (e.g. tagline, hero, about, services) via `enrichWebsiteTemplateCopy` before transformation.
