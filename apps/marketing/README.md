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

   **Notion database (prospects):** The app expects a database with properties such as **Name** or **Company** (title), **Email**, **Website**, **Phone**, **Industry** (select), **Status** (select), and optionally **Address**, **City**, **Demo link**. Alternative names (e.g. "Company Name", "E-mail", "Vertical", "Stage") are supported. Without Notion/Resend, the app runs with **stub data**. Without Google/SESSION_SECRET, the app runs but **Sign in** and `/prospects` require auth to be configured.

3. **Run**

   ```bash
   npm run dev
   ```

   - Home: http://localhost:5173
   - Prospects: http://localhost:5173/prospects
   - Demo (stub): http://localhost:5173/healthcare/mock-id-1  
  - Dental demo (stub): http://localhost:5173/dental/mock-id-1

## Deploy

Connect this app to Vercel via GitHub and set the same env vars in the Vercel project. The app uses `adapter-auto` (Vercel-compatible).

## Routes

- `/` - dashboard home
- `/prospects` - CRM table (Notion-backed); **requires Google sign-in**
- `/auth/login` - sign-in page (link to Google)
- `/auth/google` - starts Google OAuth (redirect)
- `/auth/logout` - clears session and redirects to `/`
- `/healthcare/[id]` - healthcare demo (Notion row id)
- `/dental/[id]` - dental demo (Notion row id); more industry routes to be added
