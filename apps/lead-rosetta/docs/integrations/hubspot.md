# HubSpot integration setup

Sync contacts from HubSpot into your dashboard using a **Private App** access token.

## 1. Create a Private App

1. In HubSpot, go to **Settings** (gear icon).
2. In the left sidebar, open **Integrations** → **Private Apps**.
3. Click **Create a private app**.
4. Name it (e.g. "Lead Rosetta") and choose your app.

**Official docs:** [Creating private apps](https://developers.hubspot.com/docs/guides/crm/private-apps/creating-private-apps)

## 2. Set scopes (permissions)

Your private app needs read access to contacts:

1. Open the **Scopes** tab.
2. Enable at least:
   - **crm.objects.contacts.read**
   - **crm.objects.companies.read** (optional; helps with company data)
3. Save the scopes.

## 3. Get your access token

1. After saving, open the **Auth** tab (or the main app page).
2. Copy the **Access token** (starts with `pat-na1-...` or similar).
3. Keep this token secret; do not share it or commit it to code.

If you don’t see a token yet, finish creating the app and publish it; the token is shown after the app is created.

## 4. Connect in Lead Rosetta

1. In **Dashboard → Integrations**, select **HubSpot**.
2. Paste your **Private App token**.
3. Click **Connect HubSpot**.

After connecting, use **Sync to dashboard** to pull HubSpot contacts into your dashboard. CRM integrations require a **Pro** or **Agency** plan.
