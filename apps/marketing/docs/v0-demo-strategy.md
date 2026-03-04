# v0 demo generation strategy

We need to know when demo generation is "finished" so we can show the demo or fail clearly. v0 exposes two APIs with different behavior.

## Build time: 3–5 minutes (typical)

v0 app creation is **normally 3–5 minutes**. We wait then check once (no polling):

- **Strategy**: After `chats.create`, wait **4 minutes**, then call `chats.getById` once. If `demoUrl` is set, return it; if `status === 'failed'`, fail; otherwise "Demo not ready after 4 minutes. Try again."
- **UX**: Demo creation runs in a **background job**; the server request must be allowed to run at least ~4–5 minutes (wait + check).
- **Timeouts**: If the platform has strict request limits (e.g. serverless 60s), the request will be killed before we check. Use a long-lived server or worker with a 5+ minute timeout.

**Cron (optional):** Jobs are normally processed when the dashboard is open and the client polls `POST /api/jobs/demo`. To process queued jobs when no one is on the dashboard, use **Vercel Cron**: `vercel.json` has a cron that hits `GET /api/cron/jobs/demo` every 1 minute. Set `CRON_SECRET` in Vercel (Vercel sends it as `Authorization: Bearer CRON_SECRET`) and `SITE_ORIGIN` so demo links are correct. Each run processes one job (paid first, then free try demos). When a user submits the try-free form, the server also triggers the cron endpoint once (fire-and-forget) so processing can start without waiting for the next scheduled run.

**Testing the cron locally:**

1. In `.env` (or `.env.local`), set:
   - `CRON_SECRET` — any string (e.g. `my-local-cron-secret-16chars`)
   - `SITE_ORIGIN=http://localhost:5173` (or your dev server URL) so demo links use localhost
2. Start the dev server (`pnpm dev` or `npm run dev`).
3. Enqueue a demo job (e.g. from Dashboard → Clients, click Create demo for a prospect).
4. Call the cron endpoint with the secret:
   ```bash
   curl -H "Authorization: Bearer my-local-cron-secret-16chars" "http://localhost:5173/api/cron/jobs/demo"
   ```
   Use the same `CRON_SECRET` value you put in `.env`. The response is the same as `POST /api/jobs/demo` (e.g. `{ "processed": true, "status": "done", "demoLink": "..." }` or `{ "processed": false }` if the queue is empty). Note: processing one job takes ~4+ minutes (v0 wait), so the request will hang until the job finishes or fails.

## Current: Platform API + single check after 4 min

- **Endpoint**: `v0.chats.create()` then, after 4 min, `v0.chats.getById({ chatId })` once.
- **Behavior**: `chats.create` returns only a **chat id**; the build runs asynchronously. We wait 4 min then check once (no polling).
- **Strategy**: Poll `chats.getById` every 5s until `latestVersion.demoUrl` is set or `latestVersion.status === 'failed'` (up to 72 attempts = 6 min).
- **Pros**: We get a **hosted demo URL** from v0; we iframe it and don’t store HTML ourselves.
- **Cons**: No explicit "finished" signal; we only know by polling. If the API never returns `demoUrl`, we timeout after 6 min.

Ref: [Platform API overview](https://v0.app/docs/api/platform/overview), [Create Chat](https://v0.app/docs/api/platform/reference/chats/create), [Get Chat](https://v0.app/docs/api/platform/chats/get-by-id).

---

## Alternative: Model API (synchronous completion)

- **Endpoint**: `POST https://api.v0.dev/v1/chat/completions` (OpenAI Chat Completions format).
- **Behavior**: With **`stream: false`**, the request blocks until generation is done, then returns the **generated content** in `choices[0].message.content`. So we get a clear "finished" signal when the HTTP response completes.
- **Pros**:
  - Single request; no polling.
  - We know exactly when generation is done (response completion).
  - Supports streaming (`stream: true`) if we want progress later.
- **Cons**:
  - We receive **text/code** (e.g. one full HTML document string), not a hosted URL. We must **store and serve the HTML ourselves** (e.g. upload to Supabase storage, serve via `/demo/[slug]/page.html`).
  - We already have `uploadDemoContent` / `downloadDemoHtml` and a path that prefers `demo-html/{id}.html`; we’d add or use an "upload raw HTML" path and stop using v0’s `demoUrl` for that flow.

**Example (non-stream):**

```bash
curl https://api.v0.dev/v1/chat/completions \
  -H "Authorization: Bearer $V0_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "v0-1.5-md",
    "stream": false,
    "messages": [
      { "role": "user", "content": "Build a single-file HTML landing page for ..." }
    ]
  }'
```

Response when done:

```json
{
  "id": "v0-123",
  "choices": [{ "message": { "role": "assistant", "content": "<!DOCTYPE html>..." } }]
}
```

Ref: [v0 Model API](https://v0.app/docs/api/model).

---

## Recommendation

- **Keep Platform API + single check after 4 min** if we want v0-hosted demos and minimal storage (current behavior).
- **Switch to Model API** if we want a single request and a clear "finished" signal and are okay hosting the generated HTML ourselves (reuse or extend existing demo storage and `/demo/[slug]/page.html`).

If we adopt the Model API, next steps are: add a small client for `POST /v1/chat/completions` with our prompt, parse `choices[0].message.content`, upload that HTML (e.g. to `demo-html/{prospectId}.html`), and serve it via the existing demo page route instead of `v0DemoUrl`.
