-- Twin of supabase/migrations/20260315000000_prospects_allow_gbp.sql targeting schema dev.
-- Regenerate: pnpm run db:sync-migrations-dev
-- Apply: pnpm run db:push:dev (with SUPABASE_DATABASE_URL)

-- Allow 'gbp' provider for prospects created by the GBP dental pull script (Toronto/GTA).
alter table dev.prospects
  drop constraint if exists prospects_provider_check;

alter table dev.prospects
  add constraint prospects_provider_check
  check (provider in ('notion', 'hubspot', 'gohighlevel', 'pipedrive', 'manual', 'gbp'));

comment on column dev.prospects.provider is 'Source: notion | hubspot | gohighlevel | pipedrive | manual | gbp (script-pulled from Places API)';
