-- Twin of supabase/migrations/20260228200000_prospects_central.sql targeting schema dev.
-- Regenerate: pnpm run db:sync-migrations-dev
-- Apply: pnpm run db:push:dev (with SUPABASE_DATABASE_URL)

-- Central prospects table: dashboard list and demo tracking are keyed from here.
-- Data is synced from whatever integrations the user connects (Notion, HubSpot, GoHighLevel, Pipedrive).
-- Each row has provider + provider_row_id so we can sync back or de-dupe.

create table if not exists dev.prospects (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  provider text not null check (provider in ('notion', 'hubspot', 'gohighlevel', 'pipedrive')),
  provider_row_id text not null,
  company_name text not null default '',
  email text not null default '',
  phone text,
  website text,
  industry text,
  status text not null default 'Prospect',
  demo_link text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, provider, provider_row_id)
);

comment on column dev.prospects.provider is 'Source: notion | hubspot | gohighlevel | pipedrive';
comment on column dev.prospects.provider_row_id is 'ID of the row in that system (Notion page id, HubSpot contact id, etc.)';
comment on column dev.prospects.demo_link is 'Generated demo URL for this prospect';

create index if not exists idx_prospects_user_id on dev.prospects (user_id);
create index if not exists idx_prospects_provider on dev.prospects (provider, provider_row_id);

alter table dev.prospects enable row level security;

drop policy if exists "Allow service access to prospects" on dev.prospects;
create policy "Allow service access to prospects"
  on dev.prospects for all using (true) with check (true);

-- Link demo_tracking to prospect by our id so dashboard and demo page can key by prospect id.
alter table dev.demo_tracking
  add column if not exists prospect_id uuid references dev.prospects(id) on delete set null;

comment on column dev.demo_tracking.prospect_id is 'Our prospect uuid; set when demo is created for a prospect';

create index if not exists idx_demo_tracking_prospect_id on dev.demo_tracking (prospect_id);
