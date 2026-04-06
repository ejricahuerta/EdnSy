# Next steps: sending your first email

Checklist for sending the first lead demo email from Lead Rosetta (dashboard/CRM only; not from the CSV upload page alone).

## Prerequisites

1. **Gmail (required for Send from the app):** Connect Gmail in **Dashboard → Integrations**. Outbound mail uses the **Gmail API** only (no Resend fallback). In [Google Cloud Console](https://console.cloud.google.com/), enable **Gmail API** and create OAuth 2.0 credentials for send:
   - Set in `.env`: `GMAIL_GOOGLE_CLIENT_ID` and `GMAIL_GOOGLE_CLIENT_SECRET`.
   - Add redirect URI: `https://your-domain/auth/gmail/callback` (and `http://localhost:5173/auth/gmail/callback` for dev).

   **If you get an error about "test" or "access denied" when connecting or sending with Gmail:** Your OAuth consent screen is in **Testing** mode. Only accounts listed as **Test users** can use the app. In Google Cloud Console → **APIs & Services** → **OAuth consent screen** → **Test users**, click **+ ADD USERS** and add the Gmail address you use. Then connect Gmail again in Integrations.

2. **Supabase:** Migrations run so `prospects` and `demo_tracking` exist.

3. **Auth:** Google OAuth and `SESSION_SECRET` configured so you can sign in to the dashboard.

### Copy-only path (no Gmail)

You can always **copy** the cold / follow-up / SMS templates from the prospect or settings flows and paste into Instantly, Smartlead, or another tool. That path does not require Gmail in Integrations.

## Steps

1. **Prospects in the dashboard** — Connect at least one CRM (HubSpot, GoHighLevel, Pipedrive, or Notion) in **Dashboard → Integrations**, or add a **test prospect** from **Dashboard → Prospects** → **Add test client**.
2. **Create a demo** — In **Dashboard → Prospects**, ensure the prospect has a demo (run qualifying/GBP if needed, then **Generate demo**). The prospect should have an **email** for outreach and a **demo** link.
3. **Approve** — Set the prospect’s status to **Approved** (review queue / approve gate).
4. **Outreach** — With Gmail connected: create a **Gmail draft** from the prospect row or detail page (preview in app), then open Gmail or use **Send now** / bulk send to call `drafts.send`. Status can pass through **email_draft** then **Sent**; `demo_tracking.send_time` is set when the message is sent.

## Related

- [Architecture](architecture.md) — Core engines, Gmail outreach flow, lib layout.
- [README](../README.md) — Full setup and env vars.
