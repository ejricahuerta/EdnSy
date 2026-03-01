-- Central prospects table: dashboard list and demo tracking are keyed from here.
-- Data is synced from whatever integrations the user connects (Notion, HubSpot, GoHighLevel, Pipedrive).
-- Each row has provider + provider_row_id so we can sync back or de-dupe.

create table if not exists public.prospects (
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

comment on column public.prospects.provider is 'Source: notion | hubspot | gohighlevel | pipedrive';
comment on column public.prospects.provider_row_id is 'ID of the row in that system (Notion page id, HubSpot contact id, etc.)';
comment on column public.prospects.demo_link is 'Generated demo URL for this prospect';

create index if not exists idx_prospects_user_id on public.prospects (user_id);
create index if not exists idx_prospects_provider on public.prospects (provider, provider_row_id);

alter table public.prospects enable row level security;

create policy "Allow service access to prospects"
  on public.prospects for all using (true) with check (true);

-- Link demo_tracking to prospect by our id so dashboard and demo page can key by prospect id.
alter table public.demo_tracking
  add column if not exists prospect_id uuid references public.prospects(id) on delete set null;

comment on column public.demo_tracking.prospect_id is 'Our prospect uuid; set when demo is created for a prospect';

create index if not exists idx_demo_tracking_prospect_id on public.demo_tracking (prospect_id);
