-- Twin of supabase/migrations/20260301160000_prospects_allow_manual.sql targeting schema dev.
-- Regenerate: pnpm run db:sync-migrations-dev
-- Apply: pnpm run db:push:dev (with SUPABASE_DATABASE_URL)

-- Allow 'manual' provider so users can add test prospects from the dashboard without connecting a CRM (e.g. to send one demo).
alter table dev.prospects
  drop constraint if exists prospects_provider_check;

-- Canonicalize provider so CHECK passes (legacy casing, typos, empty → manual).
-- This migration only allows five sources; gbp is added later (maps to manual here on full replay).
update dev.prospects
set provider = case lower(trim(provider))
    when 'notion' then 'notion'
    when 'hubspot' then 'hubspot'
    when 'gohighlevel' then 'gohighlevel'
    when 'pipedrive' then 'pipedrive'
    when 'manual' then 'manual'
    else 'manual'
  end;

alter table dev.prospects
  add constraint prospects_provider_check
  check (provider in ('notion', 'hubspot', 'gohighlevel', 'pipedrive', 'manual'));

comment on column dev.prospects.provider is 'Source: notion | hubspot | gohighlevel | pipedrive | manual (added from dashboard)';
