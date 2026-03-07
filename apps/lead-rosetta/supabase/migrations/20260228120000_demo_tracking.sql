-- Demo tracking: CRM id, demo link, status, send time, scraped data.
-- RLS: users see only their own rows (user_id = auth.uid() when using Supabase Auth later).
-- For now we use user_id as text (e.g. Google sub from session); enable RLS when you add Supabase Auth.

create table if not exists public.demo_tracking (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  crm_source text not null,
  crm_prospect_id text not null,
  demo_link text not null,
  status text not null default 'draft',
  send_time timestamptz,
  scraped_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, crm_source, crm_prospect_id)
);

comment on column public.demo_tracking.crm_source is 'e.g. notion, hubspot, gohighlevel';
comment on column public.demo_tracking.crm_prospect_id is 'ID of the prospect in that CRM';
comment on column public.demo_tracking.status is 'draft | approved | sent | opened | replied';
comment on column public.demo_tracking.scraped_data is 'GBP/audit scrape result (e.g. DemoAudit shape)';

create index if not exists idx_demo_tracking_user_id on public.demo_tracking (user_id);
create index if not exists idx_demo_tracking_crm on public.demo_tracking (crm_source, crm_prospect_id);
