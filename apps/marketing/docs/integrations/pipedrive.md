# Pipedrive integration setup

Sync contacts from Pipedrive into your dashboard using your **company domain** and **API token**.

## 1. Get your company domain

Your Pipedrive URL looks like: `https://yourcompany.pipedrive.com`

- The **company domain** is the subdomain part: `yourcompany` (no `.pipedrive.com`).
- In Lead Rosetta, enter only this part (e.g. `yourcompany`) in the **Company domain** field.

## 2. Get your API token

1. Log in to [Pipedrive](https://app.pipedrive.com).
2. Click your **profile/account name** (top right) → **Personal preferences** (or **Company settings** → **Personal preferences**).
3. Open the **API** section.
4. Copy your **API token**. Keep it secret; do not share it or commit it to code.

**Official docs:** [How to find the API token](https://pipedrive.readme.io/docs/how-to-find-the-api-token) — [Authentication](https://pipedrive.readme.io/docs/core-api-concepts-authentication)

## 3. Connect in Lead Rosetta

1. In **Dashboard → Integrations**, select **Pipedrive**.
2. Enter your **Company domain** (e.g. `yourcompany`).
3. Paste your **API token**.
4. Click **Connect Pipedrive**.

After connecting, use **Sync to dashboard** to pull Pipedrive contacts into your dashboard. CRM integrations require a **Pro** or **Agency** plan.
