-- Store AI-generated dashboard overview per user. Rate-limited refresh uses generated_at.

create table if not exists public.dashboard_overview (
  user_id text primary key,
  what text not null default '',
  key_findings text not null default '',
  next text not null default '',
  stagnation text not null default '',
  generated_at timestamptz not null default now()
);

comment on table public.dashboard_overview is 'AI-generated overview (What, Key findings, Next, Stagnation) for dashboard; generated_at used for refresh cooldown';

alter table public.dashboard_overview enable row level security;

create policy "Service role full access to dashboard_overview"
  on public.dashboard_overview for all using (true) with check (true);
