-- Bootstrap for parallel dev schema (apply via `pnpm run db:push:dev`, not `supabase db push`).
create schema if not exists dev;

comment on schema dev is 'Parallel to public for local/dev runs when SUPABASE_DB_SCHEMA=dev; mirror tables via per-feature migrations in this folder.';
