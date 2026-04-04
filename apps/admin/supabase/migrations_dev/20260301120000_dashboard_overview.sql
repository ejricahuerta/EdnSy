-- Twin of supabase/migrations/20260301120000_dashboard_overview.sql targeting schema dev.
-- Regenerate: pnpm run db:sync-migrations-dev
-- Apply: pnpm run db:push:dev (with SUPABASE_DATABASE_URL)

-- Store AI-generated dashboard overview per user. Rate-limited refresh uses generated_at.

create table if not exists dev.dashboard_overview (
  user_id text primary key,
  what text not null default '',
  key_findings text not null default '',
  next text not null default '',
  stagnation text not null default '',
  generated_at timestamptz not null default now()
);

comment on table dev.dashboard_overview is 'AI-generated overview (What, Key findings, Next, Stagnation) for dashboard; generated_at used for refresh cooldown';

alter table dev.dashboard_overview enable row level security;

drop policy if exists "Service role full access to dashboard_overview" on dev.dashboard_overview;
create policy "Service role full access to dashboard_overview"
  on dev.dashboard_overview for all using (true) with check (true);
