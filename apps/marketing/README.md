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

   - `NOTION_API_KEY` - Notion integration token
   - `NOTION_DATABASE_ID` - ID of the prospects database
   - `RESEND_API_KEY` - for sending demo-created emails (later)
   - `MARKETING_API_KEY` - optional, for protecting API routes

   Without these, the app runs with **stub data** (one mock prospect and mock demo).

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
- `/prospects` - CRM table (Notion-backed)
- `/healthcare/[id]` - healthcare demo (Notion row id)
- `/dental/[id]` - dental demo (Notion row id); more industry routes to be added
