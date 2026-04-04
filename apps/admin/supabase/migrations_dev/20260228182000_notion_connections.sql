-- Twin of supabase/migrations/20260228182000_notion_connections.sql targeting schema dev.
-- Regenerate: pnpm run db:sync-migrations-dev
-- Apply: pnpm run db:push:dev (with SUPABASE_DATABASE_URL)

-- Notion connections: per-user API key + database ID (no env). user_id = '' is app default for demo pages.

create table if not exists dev.notion_connections (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default '',
  api_key text not null,
  database_id text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id)
);

comment on column dev.notion_connections.user_id is 'App user id; empty string for app default (demo pages)';
comment on column dev.notion_connections.api_key is 'Notion integration token';
comment on column dev.notion_connections.database_id is 'Notion database ID (UUID)';

create index if not exists idx_notion_connections_user_id on dev.notion_connections (user_id);

alter table dev.notion_connections enable row level security;

drop policy if exists "Allow service access" on dev.notion_connections;
create policy "Allow service access"
  on dev.notion_connections for all using (true) with check (true);
