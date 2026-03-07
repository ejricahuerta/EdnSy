# Notion integration setup

Your dashboard clients list can be powered by a Notion database. Follow these steps to get your **API key** and **Database ID**.

## 1. Create an integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations) (or **Settings & members** → **Connections** → **Develop or manage integrations**).
2. Click **+ New integration**.
3. Name it (e.g. "Lead Rosetta") and select your workspace.
4. Click **Submit**.

## 2. Get your API key (secret)

1. Open your integration and go to the **Capabilities** tab if needed.
2. In the **Configuration** area, find **Internal Integration Secret**.
3. Click **Show** and copy the value. It starts with `secret_`.
4. Keep this secret; do not share it or commit it to code.

**Official docs:** [Create a Notion integration](https://developers.notion.com/docs/create-a-notion-integration)

## 3. Get your Database ID

1. Open the Notion **database** you want to use as your clients list.
2. Look at the browser URL. It looks like:
   `https://www.notion.so/workspace/abc123def456...?v=...`
3. The **Database ID** is the long string of letters and numbers before `?v=`. Copy it.
4. If the URL has a hyphen, remove it so the ID is 32 characters (e.g. `abc123def456789012345678901234ab`).

## 4. Share the database with the integration

1. In Notion, open the same database.
2. Click the **⋯** menu (top right).
3. Click **Add connections**.
4. Search for your integration name and select it.

Without this step, the integration cannot read or sync the database.

## 5. Connect in Lead Rosetta

1. In **Dashboard → Integrations**, select **Notion**.
2. Paste your **API key** and **Database ID**.
3. Click **Connect Notion**.

After connecting, use **Sync to dashboard** to pull rows from the database into your dashboard clients list.
