# Dev schema migrations (manual apply)

Files here mirror `../migrations/*.sql` but target the **`dev`** Postgres schema. They are **not** executed by `supabase db push`.

## Regenerate twins from `migrations/`

After you add or change a file under `supabase/migrations/`, regenerate the dev copies:

```bash
cd apps/admin
pnpm run db:sync-migrations-dev
```

That overwrites every `migrations_dev/<same-timestamp>_<name>.sql` that has a twin in `migrations/`. It does **not** delete `20260101000000_dev_schema_bootstrap.sql` (no matching file in `migrations/`).

Then apply to the database:

```bash
pnpm run db:push:dev
```

(`SUPABASE_DATABASE_URL` in `apps/admin/.env` — see [docs/supabase-schema.md](../../docs/supabase-schema.md).)

## Hand-maintained bootstrap

`20260101000000_dev_schema_bootstrap.sql` only runs `create schema if not exists dev;` (and a comment). Edit it directly if needed; it is not produced by the sync script.

## When the generator is not enough

If a new `public` migration uses patterns the sync script does not handle (unusual `public` references without a dot, custom publication names, etc.), run `pnpm run db:sync-migrations-dev` first, then fix the generated dev file by hand and document the exception in your PR.

## Why separate from `migrations/`?

The Supabase CLI applies every `.sql` file in `supabase/migrations/` in order. Dev-schema DDL stays in this folder so production keeps a single migration history while you can point the app at `dev` with `SUPABASE_DB_SCHEMA=dev`.
