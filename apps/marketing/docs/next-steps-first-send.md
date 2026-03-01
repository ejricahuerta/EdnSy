# Next steps until you can send one demo

Use this checklist to get from zero to **one sent demo** (v1 milestone).

**This is the CRM/dashboard flow:** you create the demo and send the email from **Dashboard → Clients**. Not the landing flow (/try or /upload): those create one-off demos and do not send to the client from the app.

## 1. Environment

- [ ] **Resend:** Set `RESEND_API_KEY` in `.env` (get from [Resend](https://resend.com) → API Keys).
- [ ] **From address (dev):** Leave unset to use `onboarding@resend.dev`, or set `RESEND_FROM_EMAIL` and `RESEND_FROM_NAME`.
- [ ] **From address (prod):** Set `RESEND_FROM_EMAIL=leadrosetta@ednsy.com` and `RESEND_FROM_NAME=Lead Rosetta`; verify the domain in Resend.

## 2. Database (Supabase)

- [ ] Supabase project created; `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`.
- [ ] Run all migrations (see README) including `20260301160000_prospects_allow_manual.sql` so you can add a test client without a CRM.

## 3. Auth (so you can open the dashboard)

- [ ] Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET` in `.env`.
- [ ] Sign in at `/auth/login` and open `/dashboard` → **Clients**.

## 4. One prospect to send to

- [ ] **Add test client (no CRM):** On Dashboard → Clients, click **Add test client**. Enter company name, your own email (or a test inbox), and industry. Submit. The new row appears in the table.

  Or use a CRM: connect an integration (Notion, HubSpot, GoHighLevel, or Pipedrive) in Dashboard → Integrations, sync, then pick a contact that has an email.

## 5. Create the demo (from the dashboard)

- [ ] In the **Clients** table (dashboard), open the prospect (or use the row action) and click **Create demo**. Wait until the demo link appears.
- [ ] Or use the bulk **Generate** flow: select the row(s), click **Generate**, then open each and confirm the demo link.

(Do not use /try or /upload for this flow; those are for one-off demos and do not send email from the app.)

## 6. Approve and send

- [ ] Set the prospect’s status to **Approved** (row action or bulk **Approve**).
- [ ] Check the **Acceptable Use Policy** checkbox.
- [ ] Select the approved prospect row and click **Send**.
- [ ] Check the recipient inbox (and Resend dashboard if needed). When one email is delivered, you’ve hit the v1 send milestone.

## If something fails

- **“Email sending is not configured”** → Add `RESEND_API_KEY` (and optionally `RESEND_FROM_EMAIL`) and restart the app.
- **“Select at least one client to send”** → Select the row(s) before clicking Send.
- **“No email or phone”** → The prospect must have an email; add it or use a different prospect.
- **Send returns but no email** → Check Resend dashboard for bounces or domain verification; in dev, `onboarding@resend.dev` can only send to the email you used to sign up for Resend.
