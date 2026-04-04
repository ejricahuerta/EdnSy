# Supabase server schema (`SUPABASE_DB_SCHEMA`)

## Purpose

Table and RPC calls from **server-side** code use the Postgres schema set by `SUPABASE_DB_SCHEMA` (default `public`). This lets you point the admin app and the website-template generator at a parallel **`dev`** schema on the same Supabase project without changing URLs or keys.

- **Admin:** `getSupabaseAdmin()` and the SSR Supabase client in `hooks.server.ts` both read this setting.
- **Website template:** `generate.js` passes the same option into `createClient` for any PostgREST usage (storage calls are unaffected by schema).

The variable is **private** (not `PUBLIC_*`): configure it in `.env` or the host environment when you run the app or `node generate.js`.

## Choosing a schema at run time

```bash
# Windows PowerShell
$env:SUPABASE_DB_SCHEMA="dev"; pnpm dev

# Unix
SUPABASE_DB_SCHEMA=dev pnpm dev
```

Use `public` in production unless you intentionally isolate data in another schema.

## Exposing `dev` in the API

Local CLI config includes `dev` in `[api].schemas` in `apps/admin/supabase/config.toml`. On hosted Supabase, add `dev` under **Settings → API → Exposed schemas** so PostgREST can serve `dev.*` tables.

Create the schema once (SQL editor or migration):

```sql
create schema if not exists dev;
```

Grant usage to `service_role` / `authenticated` as needed for your RLS and policies (mirror `public` if you want parity).

## Browser and Realtime

Client-side `createBrowserClient` does **not** read `SUPABASE_DB_SCHEMA`. If dashboards use Realtime or direct `.from()` calls against tables that live only in `dev`, those clients must use the same `db.schema` option; that usually means passing the schema from server `load` data or keeping browser traffic on `public`. See project rules in `.cursor/rules/supabase-db-schema-migrations.mdc`.

## `db push` is only for `public` (canonical migrations)

`supabase db push` always applies **`supabase/migrations/`** and records versions in the remote migration history table. The CLI has **no flag** to push “only `dev`” or to use `migrations_dev/` instead.

- **Update `public` (normal flow):** `pnpm run db:push` from `apps/admin` (or `supabase db push --linked`).
- **Update `dev` only:** apply the parallel SQL under `supabase/migrations_dev/` yourself:
  - **Script (sorted `.sql` files, direct Postgres):** in `apps/admin/.env` set **`SUPABASE_DATABASE_URL`** to the **Postgres URI** from **Dashboard → Database** (same file as `SUPABASE_URL` / keys; not the HTTPS API URL). Aliases accepted: `SUPABASE_DB_URL`, `SUPABASE_DIRECT_URL`, `SUPABASE_DB_DIRECT_URL`, `DATABASE_URL`. Then run:

    ```bash
    pnpm run db:push:dev
    ```

  - **Or** run each file in order in the SQL editor / `psql`.

The dev script does **not** write to Supabase’s migration history table; it only executes DDL. Re-running files that use `IF NOT EXISTS` is usually safe; avoid duplicate destructive changes in the same file.

## Twin migrations (`migrations` + `migrations_dev`)

- **`supabase/migrations/`** — applied by `supabase db push` (canonical `public` DDL).
- **`supabase/migrations_dev/`** — **not** run by `db push`. Twins are generated with `pnpm run db:sync-migrations-dev` (same filenames, `dev` schema). Apply with `pnpm run db:push:dev` or manually.

After adding or editing `supabase/migrations/*.sql`, regenerate and apply dev DDL from `apps/admin`:

```bash
pnpm run db:sync-migrations-dev
pnpm run db:push:dev
```

`db:sync-migrations-dev` writes `migrations_dev/<same-filename>.sql` (plus idempotent handling for `supabase_realtime` publication on `dev.*` tables). Hand-edit only when the generator misses an edge case.

Apply `migrations_dev` on environments that use the `dev` schema with `pnpm run db:push:dev`, the SQL editor, or `psql`.

## `db:push:dev` and `ENOTFOUND` (DNS)

If Node reports `getaddrinfo ENOTFOUND` for `db.<ref>.supabase.co` (or another host), the hostname in **`SUPABASE_DATABASE_URL` does not resolve**. Common causes:

1. **Stale or hand-edited URI** — Re-copy **Project Settings → Database → Connection string → URI** from the dashboard. Do not guess `db.` from `SUPABASE_URL`; use the exact string Supabase shows (often a **pooler** host like `aws-0-….pooler.supabase.com` for session mode).
2. **Wrong project** — The `<ref>` in `https://<ref>.supabase.co` must match the database connection string for that same project.
3. **Paused project** — Restore the project so database endpoints are active.
4. **Network** — VPN, corporate DNS, or offline use can block resolution even when the dashboard works in the browser.
