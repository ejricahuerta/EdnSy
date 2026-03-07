# GoHighLevel integration setup

Sync contacts from GoHighLevel (GHL) into your dashboard using an **API token** (Sub-Account or Location token).

## 1. Choose token type

- **Sub-Account (Location) token:** Use this if you want to sync contacts for a single location/sub-account. Best for most users.
- **Agency token:** If you manage multiple locations, you may need to generate a location-specific token from your agency token (see GHL’s OAuth/location token docs).

**Official docs:** [HighLevel API](https://marketplace.gohighlevel.com/docs/) — [Access token use cases](https://marketplace.gohighlevel.com/docs/Authorization/AccessTokenUseCase/index.html)

## 2. Get a Sub-Account (Location) API token

1. Log in to [GoHighLevel](https://app.gohighlevel.com) and open the **Sub-Account (Location)** you want to sync.
2. Go to **Settings** (gear icon) → **API Keys** (or **Integrations** → **API**).
3. Create or copy an **API key** / **Private integration token** for that location.
4. Ensure the token has at least **contacts read** (e.g. `contacts.readonly`) so we can sync contacts.
5. Copy the token and store it securely.

If you use the marketplace/OAuth flow instead, follow GHL’s docs to get a location-level access token.

## 3. Connect in Lead Rosetta

1. In **Dashboard → Integrations**, select **GoHighLevel**.
2. Paste your **API token** (Sub-Account or Location token).
3. Click **Connect GoHighLevel**.

After connecting, use **Sync to dashboard** to pull GHL contacts into your dashboard. CRM integrations require a **Pro** or **Agency** plan.
