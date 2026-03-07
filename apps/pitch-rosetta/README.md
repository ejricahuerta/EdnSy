# Pitch Rosetta Website Agent

AI agent that generates a single **cinematic landing page** (`index.html`) from business data (`index.json`) using the spec in `prompt.md`. **Branding** runs first (voice, colors, typography, CTAs from JSON); **planning** uses that branding; **generation** follows with branding and plan locked in. No build step — output runs in the browser as-is.

## How it works

1. **Branding phase:** Reads `prompts/branding-prompt.md` + business JSON → calls Claude → produces a structured branding spec (brand essence, audience & tone, visual direction, typography, hero/CTAs). Optional: write branding to a file with `--branding-out`. If `branding-prompt.md` is missing, this phase is skipped.
2. **Planning phase:** Reads `prompts/plan-prompt.md` + business JSON + branding (when present) → calls Claude → produces a structured plan (business personality, visual identity, typography, sections to build, map layout, image strategy). Optional: write plan to a file with `--plan-out`. If `plan-prompt.md` is missing, planning is skipped.
3. **Generate phase:** Reads `prompts/prompt.md` + approved branding + approved plan + business JSON → calls Claude (streaming) → single `index.html`.
4. **Writes** the result to `index.html` (or `--out` path).
5. **Writes** a copy to `demos/{id}.html` (id from JSON or a new GUID).
6. **Uploads** the same HTML to Supabase Storage bucket `lead-rosetta-bucket` under `demo-html/{id}.html`.

## Setup

```bash
cd apps/pitch-rosetta
npm install
cp .env.example .env   # or create .env
# Edit .env and set CLAUDE_API_KEY (or ANTHROPIC_API_KEY); get one at https://console.anthropic.com/
```

## Usage

### CLI (file-based)

From the `apps/pitch-rosetta` folder. A sample **`index.json`** (Ember & Oak Bistro) is included so `npm run generate` works with default paths; replace it or use `--json=path/to/your-data.json` for your own business data.

```bash
# Use default paths: prompts/prompt.md, index.json → index.html (and demos/{id}.html)
npm run generate
```

### API (HTTP)

Start the server, then send business data as JSON in the request body. **POST endpoints require an API key** when `DEMO_GENERATOR_API_KEY` or `PITCH_ROSETTA_API_KEY` is set (e.g. on Render); send `Authorization: Bearer <key>`.

```bash
npm start
# Server runs at http://localhost:3000 (or PORT from env)
```

| Endpoint | Method | Description |
|----------|--------|--------------|
| `/api/generate` | POST | Body: business data (same shape as `index.json`). Returns `{ id, publicUrl?, plan?, branding? }` (no `html`). Requires API key when env is set. |
| `/api/generate-async` | POST | Body: business data plus `jobId`, `prospectId`, `userId?`, `callbackUrl`, `callbackToken`. Returns **202 Accepted** immediately; runs generation in background, then POSTs to `callbackUrl` with `{ jobId, prospectId, userId?, publicUrl? }` on success or `{ jobId, prospectId, userId?, error }` on failure. Requires API key when env is set. |
| `/api/health` | GET | Health check; returns `{ status: "ok" }`. |
| `/` | GET | Service info and endpoint list. |

**Sync example:**

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d @index.json
```

Response (200): JSON with `id`, `publicUrl`, `plan`, `branding` (no `html`). On error: 401 (missing/invalid API key), 400 (invalid body), 500 (generation failed), or 503 (e.g. missing ANTHROPIC_API_KEY).

**Async (callback) contract:** When using `/api/generate-async`, the server returns 202 with `{ id: jobId, status: "accepted" }`. When generation finishes, it POSTs to your `callbackUrl` with header `Authorization: Bearer <callbackToken>`. Success body: `{ jobId, prospectId, userId?, publicUrl?, html? }`. When `html` is included, the callback receiver (e.g. Lead Rosetta app) stores it so the demo page loads. Failure body: `{ jobId, prospectId, userId?, error: string }`. Callback URL must be HTTPS (or HTTP for loopback: `localhost`, `127.0.0.1`). If `ALLOWED_CALLBACK_ORIGINS` is set, the URL origin must match one of the comma-separated origins (e.g. `http://localhost:5173` for local dev).

Custom paths:

```bash
node generate.js --json=index.json --out=index.html
node generate.js --json=./my-business.json --out=./output/index.html
node generate.js --prompt=prompts/prompt.md --json=index.json --out=index.html
node generate.js --plan-out=plan.md
node generate.js --branding-out=branding.md
```

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `--prompt=` | `prompts/prompt.md` | Path to the build spec markdown. |
| `--branding-prompt=` | `prompts/branding-prompt.md` | Path to the branding prompt. If missing, branding phase is skipped. |
| `--branding-out=` | *(none)* | If set, the branding spec is written to this path before planning. |
| `--plan-prompt=` | `prompts/plan-prompt.md` | Path to the planning prompt. If missing, planning is skipped. |
| `--plan-out=` | *(none)* | If set, the structured plan is written to this path before generation. |
| `--json=` | `index.json` | Path to the business data JSON (CLI only; API sends JSON in body). |
| `--out=` | `index.html` | Path where the generated HTML is written. |

## Requirements

- **Node.js** 20+
- **CLAUDE_API_KEY** (or ANTHROPIC_API_KEY) in environment or `.env` (or `keys.json` → `Claude.apiKey`)
- **Supabase (optional):** set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`, or ensure `keys.json` exists at repo root with `Supabase.rosetta` (url, serviceRoleKey). If not configured, upload is skipped.
- **API key (optional but recommended for production):** set `DEMO_GENERATOR_API_KEY` or `PITCH_ROSETTA_API_KEY` to require `Authorization: Bearer <key>` on `POST /api/generate` and `POST /api/generate-async`. If unset, those routes accept requests without auth (use only in trusted environments).
- **Callback allowlist (optional):** set `ALLOWED_CALLBACK_ORIGINS` to a comma-separated list of allowed origins (e.g. `https://your-app.vercel.app`). When set, `/api/generate-async` will only accept `callbackUrl` values whose origin is in this list (reduces SSRF risk).
- **Debug logging:** set `DEBUG=1` or `DEBUG=pitch-rosetta` to enable request/generation phase logs (server and CLI). Logs are prefixed with `[pitch-rosetta]`.

## Output

The generated `index.html` is self-contained (inline CSS/JS), uses the design system from the prompt (navbar, hero, features, about, contact, map, animations, etc.), and respects whatever fields exist in your JSON. Open the file in a browser to view.

**Supabase:** After writing the local file, the agent uploads the HTML to bucket `lead-rosetta-bucket` at `demo-html/{guid}.html` (a new GUID each run). Ensure that bucket exists and is allowed for your Supabase project; the script logs the storage path and public URL when upload succeeds.
