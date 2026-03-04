# GBP scraping: walkthrough and where it lives

## Implemented flow

1. **Input** — User provides business name (min); optional URL, location. Prospect comes from Dashboard → Clients (CRM or Add test client), or /try, /upload.

2. **GBP scrape (F1)** — Implemented in `src/lib/server/gbp.ts`.
   - When **DataForSEO** is configured (`DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD`), the app calls DataForSEO Business Data API (my_business_info): POST task with keyword (business name) + location + language, then polls until result is ready (max ~55s).
   - Response is normalized to `GbpData` (name, industry, address, phone, website, ratingValue, ratingCount, isClaimed, workHours). Review text is not fetched in v1 (would require a separate DataForSEO Reviews API call with `cid`).
   - **ScrapingBee** and **posts** are not implemented in v1.

3. **Build audit** — `buildAuditFromGbp(gbp, prospect)` in `gbp.ts` turns `GbpData` into a `DemoAudit` (website status, review count, GBP completeness, etc.). Stored object includes `gbpRaw` for templates. If DataForSEO is not configured or fetch fails, the app falls back to **Gemini** (`generateAuditForProspect` in `generateAudit.ts`).

4. **Generate demo** — Dashboard actions (Clients, Dashboard, [id]) call `getScrapedDataForDemo(prospect)`, which returns audit (+ optional gbpRaw). Result is saved to `demo_tracking.scraped_data`. When GBP data is present, prospect is enriched via `updateProspectFromGbp` (phone, website, address, industry).

5. **Demo page** — Loads prospect + audit from `getScrapedDataForProspect`; if shape matches `DemoAudit`, uses it; otherwise mock.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATAFORSEO_LOGIN` | For GBP | DataForSEO API login (from [app.dataforseo.com](https://app.dataforseo.com/api-access)) |
| `DATAFORSEO_PASSWORD` | For GBP | DataForSEO API password |
| `DATAFORSEO_DEFAULT_LOCATION` | No | Location for GBP lookup (e.g. `Toronto,Ontario,Canada`). Default: `Toronto,Ontario,Canada`. |
| `DATAFORSEO_DEFAULT_LANGUAGE_CODE` | No | Language code (default `en`). |

Without these, demo creation uses the Gemini fallback (synthetic audit from name, industry, website).

## Where things live

| Step | Code |
|------|------|
| **GBP fetch** | `src/lib/server/gbp.ts` — `fetchGbpForProspect`, `getScrapedDataForDemo` |
| **Build audit from GBP** | `src/lib/server/gbp.ts` — `buildAuditFromGbp` |
| **Fallback audit** | `src/lib/server/generateAudit.ts` — `generateAuditForProspect` (Gemini) |
| **Demo creation** | `src/routes/dashboard/clients/+page.server.ts`, `dashboard/+page.server.ts`, `dashboard/[id]/+page.server.ts` — call `getScrapedDataForDemo`, then `updateDemoTrackingStatus` and optionally `updateProspectFromGbp` |
| **Stored shape** | `demo_tracking.scraped_data`: `DemoAudit` with optional `gbpRaw` (GbpData). Backward compatible with `isDemoAuditShape`. |
| **Prospect enrichment** | `src/lib/server/prospects.ts` — `updateProspectFromGbp`. Prospect table has optional `address` (migration `20260303120000_prospects_add_address.sql`). |

## Out of scope (v1)

- **ScrapingBee** (website/socials): not implemented.
- **Posts (GMB updates):** not in DataForSEO my_business_info response; omitted.
- **Review text:** my_business_info returns rating/votes only; full review text would require DataForSEO Reviews API (separate task with `cid`); v1 uses count/value only.
- **Try / Upload:** Dashboard flows use GBP; try and upload are unchanged (no demo_tracking or different flow).
