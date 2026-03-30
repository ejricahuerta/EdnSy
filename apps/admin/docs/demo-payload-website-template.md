# Demo payload contract: Ed & Sy Admin to Website Template

When Ed & Sy Admin creates a paid demo, it sends a structured JSON payload to the Website Template service. The **endpoint is chosen by industry**:

- **Dental** → `POST /api/dental-async` (template render; callback includes `html`).
- **All other industries** → `POST /api/generate-async` (AI full generation; callback includes `publicUrl` or `html`).

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
- **Usage:** `processDemoJob` builds and enriches the landing JSON, then calls the transformer and sends the result plus callback meta to Website Template. The industry slug (e.g. `dental`) determines which endpoint is used; see `DEMO_GENERATOR_ENDPOINT_BY_INDUSTRY` in `processDemoJob.ts`. To add another industry-specific endpoint, add an entry there and implement the route in website-template.

Content that is missing from GBP and insights is filled with industry defaults and, where applicable, AI-generated copy (e.g. tagline, hero, about, services) via `enrichWebsiteTemplateCopy` before transformation.
