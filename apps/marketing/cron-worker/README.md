# Marketing Cron Worker (Cloudflare)

This Worker runs on a schedule and calls the marketing app’s cron endpoints on Vercel. Use it instead of Vercel Cron to avoid cron invocation limits.

## Schedules

- **Demo jobs:** `GET /api/cron/jobs/demo` every 1 minute
- **GBP jobs:** `GET /api/cron/jobs/gbp` every 2 minutes

The same `CRON_SECRET` used by the marketing app must be set here so the app accepts the requests.

## Setup

1. **Install and deploy from this directory**

   ```bash
   cd apps/marketing/cron-worker
   npm install
   ```

2. **Configure the app URL**

   Edit `wrangler.toml` and set `CRON_TARGET_URL` under `[vars]` to your marketing app’s base URL (no trailing slash), e.g.:

   ```toml
   CRON_TARGET_URL = "https://ednsy-marketing.vercel.app"
   ```

   Or set **CRON_TARGET_URL** in [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages → your worker → Settings → Variables.

3. **Set the cron secret**

   Use the same value as `CRON_SECRET` in your Vercel project:

   ```bash
   npx wrangler secret put CRON_SECRET
   ```

   Enter the same secret you use in Vercel for the marketing app.

4. **Deploy**

   ```bash
   npx wrangler deploy
   ```

   After the first deploy, Cron Triggers will run automatically (no extra step in the dashboard).

## Test locally

```bash
npx wrangler dev --test-scheduled
```

Then in another terminal:

```bash
# Simulate demo cron (every 1 min)
curl "http://localhost:8787/__scheduled?cron=*%2F1+*+*+*+*"

# Simulate GBP cron (every 2 min)
curl "http://localhost:8787/__scheduled?cron=*%2F2+*+*+*+*"
```

Your app must be reachable (e.g. Vercel preview or ngrok) and `CRON_TARGET_URL` / `CRON_SECRET` must be set in `.dev.vars` for local dev:

```bash
# .dev.vars (create in cron-worker folder, do not commit)
CRON_SECRET=your-secret
CRON_TARGET_URL=https://your-app.vercel.app
```

## Logs

```bash
npx wrangler tail
```

Watch for `[cron-worker] demo:` and `[cron-worker] gbp:` lines.

## Limits

Cloudflare Workers free tier: 100,000 requests/day. At 1/min + 1 every 2 min you stay well under that.
