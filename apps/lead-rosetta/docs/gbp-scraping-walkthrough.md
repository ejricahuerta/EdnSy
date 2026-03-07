# GBP data: walkthrough and where it lives

## Implemented flow

1. **Input** — User provides business name (min); optional URL, location. Prospect comes from Dashboard → Prospects (CRM or Add test client), or /try, /upload.

2. **GBP fetch** — Implemented in `src/lib/server/gbp.ts` and `src/lib/server/placesApi.ts`.
   - When **Google Places API** is configured (`GOOGLE_PLACES_API_KEY` or `GOOGLE_MAPS_API_KEY`), the app calls Places API (New): **Text Search** (business name + location) to get a place ID, then **Place Details** to get name, address, phone, website, rating, hours.
   - Response is normalized to `GbpData` (name, industry, address, phone, website, ratingValue, ratingCount, reviews, isClaimed, workHours). Review text is not fetched in v1.
   - **Monthly usage lock:** Before each lookup, the app calls `tryIncrementPlacesUsage()` (see `src/lib/server/supabase.ts`). Usage is stored in `places_api_usage` (month_key, lookups_count). If the count for the current month is at or over the limit (`PLACES_API_MONTHLY_LIMIT`, default 10,000), the request is blocked and no API call is made. Limit resets each month.

3. **Build audit** — `buildAuditFromGbp(gbp, prospect)` in `gbp.ts` turns `GbpData` into a `DemoAudit`. Stored object includes `gbpRaw` for templates. If Places API is not configured or fetch fails, the app falls back to **Gemini** (`generateAuditForProspect` in `generateAudit.ts`) or name-only flow where applicable.

4. **Generate demo** — Demo jobs use scraped data already in `demo_tracking` from the qualifying (GBP) step. They do not fetch GBP or run Pull insights; if scraped data is missing, the job fails with "Complete the qualifying (GBP) step first." When GBP data is present, prospect is enriched via `updateProspectFromGbp`.

5. **Demo page** — Loads prospect + audit from `getScrapedDataForProspect`; if shape matches `DemoAudit`, uses it; otherwise mock.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_PLACES_API_KEY` or `GOOGLE_MAPS_API_KEY` | For GBP | Google Maps Platform API key with Places API (New) enabled. Used for Text Search + Place Details. |
| `PLACES_API_MONTHLY_LIMIT` | No | Max lookups per month (default 10,000). When reached, new lookups are blocked until next month. |

Without an API key, demo creation uses the Gemini fallback (synthetic audit from name, industry, website).

## Where things live

| Step | Code |
|------|------|
| **GBP fetch** | `src/lib/server/gbp.ts` — `fetchGbpForProspect` (gate + delegate); `src/lib/server/placesApi.ts` — `fetchGbpFromPlaces`, Text Search + Place Details |
| **Usage lock** | `src/lib/server/supabase.ts` — `tryIncrementPlacesUsage`, `getPlacesUsageMonthKey`; table `places_api_usage`; RPC `increment_places_usage_if_under_limit` |
| **Build audit from GBP** | `src/lib/server/gbp.ts` — `buildAuditFromGbp` |
| **Fallback audit** | `src/lib/server/generateAudit.ts` — `generateAuditForProspect` (Gemini) |
| **Demo creation** | `src/lib/server/processDemoJob.ts` — uses `getScrapedDataForProspectForUser` (scraped_data from qualifying step only); dashboard enqueues job via `POST /api/jobs/demo` |
| **Stored shape** | `demo_tracking.scraped_data`: `DemoAudit` with optional `gbpRaw` (GbpData). Backward compatible with `isDemoAuditShape`. |
| **Prospect enrichment** | `src/lib/server/prospects.ts` — `updateProspectFromGbp`. Prospect table has optional `address` (migration `20260303120000_prospects_add_address.sql`). |

## Out of scope (v1)

- **ScrapingBee** (website/socials): not implemented.
- **Posts (GMB updates):** not in Places API response; omitted.
- **Review text:** Place Details can return reviews (Enterprise+ SKU); v1 uses rating/count only.
- **Try / Upload:** Dashboard flows use GBP; try and upload are unchanged (no demo_tracking or different flow).
