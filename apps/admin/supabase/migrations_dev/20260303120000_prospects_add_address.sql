-- Twin of supabase/migrations/20260303120000_prospects_add_address.sql targeting schema dev.
-- Regenerate: pnpm run db:sync-migrations-dev
-- Apply: pnpm run db:push:dev (with SUPABASE_DATABASE_URL)

-- Add address to prospects for GBP backfill and display (optional).
alter table dev.prospects
  add column if not exists address text;

comment on column dev.prospects.address is 'Formatted address; backfilled from GBP when available.';
