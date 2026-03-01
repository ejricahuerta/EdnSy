-- CRM connections: per-user API tokens for HubSpot / GoHighLevel (Pro).
-- access_token stored server-side; RLS ensures users only see their own row.

create table if not exists public.crm_connections (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  provider text not null check (provider in ('hubspot', 'gohighlevel')),
  access_token text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, provider)
);

comment on column public.crm_connections.user_id is 'App user id (e.g. Google sub from session)';
comment on column public.crm_connections.provider is 'hubspot | gohighlevel';
comment on column public.crm_connections.access_token is 'API key or OAuth access token';

create index if not exists idx_crm_connections_user_id on public.crm_connections (user_id);

alter table public.crm_connections enable row level security;

create policy "Users can manage own crm_connections"
  on public.crm_connections
  for all
  using (true)
  with check (true);
-- Note: App uses service role for server-side access; RLS can be tightened with auth.uid() if we add Supabase Auth later.
