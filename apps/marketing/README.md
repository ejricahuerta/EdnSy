# EdnSy Marketing

SvelteKit app for the marketing CRM: prospects table, industry demo pages, and (later) generate-demo + Resend email flow.

## Stack

- Svelte 5 + SvelteKit
- Tailwind v4 + daisyUI
- Notion API (prospects); Resend (email). Env required for production.

## Setup

1. **Install dependencies**

   ```bash
   cd apps/marketing && npm install
   ```

   On Windows, if `npm run build` fails with a Rollup error (`@rollup/rollup-win32-x64-msvc`), try:

   ```bash
   rm -r node_modules package-lock.json   # or on PowerShell: Remove-Item -Recurse node_modules; Remove-Item package-lock.json
   npm install
   ```

   Or use **pnpm** in the repo if available; it often handles optional dependencies better.

2. **Environment**

   Copy `.env.example` to `.env` and set:

   - `NOTION_API_KEY` - Notion integration token (create at [notion.so/my-integrations](https://www.notion.so/my-integrations))
   - `NOTION_DATABASE_ID` - ID of the prospects database (from the database URL: `notion.so/workspace/DATABASE_ID?v=...`). **Share the database with your integration** (Database → Connect to → your integration) so the API can read it.
   - `RESEND_API_KEY` - for sending demo-created emails (later)
   - `MARKETING_API_KEY` - optional, for protecting API routes
   - **Google login** (for `/prospects` and auth):
     - `GOOGLE_CLIENT_ID` - Google OAuth client ID (Cloud Console)
     - `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
     - `SESSION_SECRET` - at least 16 characters; used to sign session cookies

   Add your app’s **Authorized redirect URI** in Google Cloud Console:  
   `http://localhost:5173/auth/google/callback` (dev) or your production origin + `/auth/google/callback`.

   **Notion database (prospects):** The app expects a database with properties such as **Name** or **Company** (title), **Email**, **Website**, **Phone**, **Industry** (select), **Status** (select), and optionally **Address**, **City**, **Demo link**. Alternative names (e.g. "Company Name", "E-mail", "Vertical", "Stage") are supported. **Notion is required** for the prospects table and industry demo pages; without it, the prospects list is empty and demo pages return 404. Without Google/SESSION_SECRET, the app runs but **Sign in** and `/prospects` require auth to be configured.

3. **Run**

   ```bash
   npm run dev
   ```

   - Home: http://localhost:5173
   - Prospects: http://localhost:5173/prospects
   - Demo pages use Notion row IDs, e.g. http://localhost:5173/healthcare/[notion-page-id]

## Deploy (Vercel)

1. **Connect the repo** to Vercel and import the project.

2. **Set Root Directory** (if this app lives in a monorepo):
   - In Vercel: Project → **Settings** → **General** → **Root Directory** → set to `apps/marketing`.
   - This ensures Vercel builds and runs this app, not the repo root.

3. **Environment variables** (Project → **Settings** → **Environment Variables**):
   - Add `NOTION_API_KEY` and `NOTION_DATABASE_ID` (required for prospects and demos).
   - Add Google OAuth and session vars if you use `/prospects`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`.
   - Use the **exact** names above (case-sensitive). Assign to **Production** (and **Preview** if you use preview deployments).

4. **Redeploy** after adding or changing env vars (Deployments → ⋯ → Redeploy).

If you see “Notion is not configured” or an empty prospects list on Vercel, confirm Root Directory is `apps/marketing` and both Notion env vars are set for the correct environment.

## Routes

- `/` - dashboard home
- `/prospects` - CRM table (Notion-backed); **requires Google sign-in**
- `/auth/login` - sign-in page (link to Google)
- `/auth/google` - starts Google OAuth (redirect)
- `/auth/logout` - clears session and redirects to `/`
- `/healthcare/[id]` - healthcare demo (Notion row id)
- `/dental/[id]` - dental demo (Notion row id); more industry routes to be added
