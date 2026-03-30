# Next steps: sending your first email

Checklist for sending the first lead demo email from Lead Rosetta (dashboard/CRM only; not from /try or /upload).

## Prerequisites

1. **Resend:** Set `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and optionally `RESEND_FROM_NAME` in `.env`. Verify your domain in [Resend](https://resend.com).
2. **Supabase:** Migrations run so `prospects` and `demo_tracking` exist.
3. **Auth:** Google OAuth and `SESSION_SECRET` configured so you can sign in to the dashboard.

### Sending via Gmail (optional)

You can connect Gmail in **Dashboard → Integrations** so emails send from your Gmail address instead of Resend. You need a **separate** OAuth client for Gmail send:

- In [Google Cloud Console](https://console.cloud.google.com/), create OAuth 2.0 credentials (or use a second client) for the **Gmail API**.
- Set in `.env`: `GMAIL_GOOGLE_CLIENT_ID` and `GMAIL_GOOGLE_CLIENT_SECRET`.
- Add the redirect URI: `https://your-domain/auth/gmail/callback` (and `http://localhost:5173/auth/gmail/callback` for dev).

**If you get an error about "test" or "access denied" when connecting or sending with Gmail:** Your OAuth consent screen is in **Testing** mode. Only accounts listed as **Test users** can use the app. In Google Cloud Console → **APIs & Services** → **OAuth consent screen** → **Test users**, click **+ ADD USERS** and add the Gmail address you use (e.g. your work or personal Gmail). After that, connect Gmail again in Lead Rosetta Integrations and try sending.

## Steps

1. **Prospects in the dashboard** — Connect at least one CRM (HubSpot, GoHighLevel, Pipedrive, or Notion) in **Dashboard → Integrations**, or add a **test prospect** from **Dashboard → Prospects** → **Add test client**.
2. **Create a demo** — In **Dashboard → Prospects**, ensure the prospect has a demo (run qualifying/GBP if needed, then **Generate demo**). The prospect must have an **email** and a **demo** link.
3. **Approve** — Set the prospect’s status to **Approved** (review queue / approve gate).
4. **Send** — On the prospect row, check the **Acceptable Use Policy** box and click **Send**. Starter plan and above can use the Send button.

After sending, status moves to **Sent** and `demo_tracking.send_time` is set.

## Related

- [Architecture](architecture.md) — Core engines and lib layout.
- [README](../README.md) — Full setup and env vars.
