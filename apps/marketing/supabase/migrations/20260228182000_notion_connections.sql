-- Notion connections: per-user API key + database ID (no env). user_id = '' is app default for demo pages.

create table if not exists public.notion_connections (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default '',
  api_key text not null,
  database_id text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id)
);

comment on column public.notion_connections.user_id is 'App user id; empty string for app default (demo pages)';
comment on column public.notion_connections.api_key is 'Notion integration token';
comment on column public.notion_connections.database_id is 'Notion database ID (UUID)';

create index if not exists idx_notion_connections_user_id on public.notion_connections (user_id);

alter table public.notion_connections enable row level security;

create policy "Allow service access"
  on public.notion_connections for all using (true) with check (true);
