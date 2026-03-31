-- Dashboard Realtime: per-user SELECT via Google identity (provider_id = prospects.user_id).
-- Service role (server) bypasses RLS unchanged.

drop policy if exists "Allow service access to prospects" on public.prospects;

create policy "prospects_select_own" on public.prospects
  for select
  to authenticated
  using (
    user_id in (
      select i.provider_id
      from auth.identities i
      where i.user_id = auth.uid()
        and i.provider = 'google'
    )
  );

alter table public.demo_jobs enable row level security;
alter table public.gbp_jobs enable row level security;
alter table public.insights_jobs enable row level security;

drop policy if exists "demo_jobs_select_own" on public.demo_jobs;
create policy "demo_jobs_select_own" on public.demo_jobs
  for select
  to authenticated
  using (
    user_id in (
      select i.provider_id
      from auth.identities i
      where i.user_id = auth.uid()
        and i.provider = 'google'
    )
  );

drop policy if exists "gbp_jobs_select_own" on public.gbp_jobs;
create policy "gbp_jobs_select_own" on public.gbp_jobs
  for select
  to authenticated
  using (
    user_id in (
      select i.provider_id
      from auth.identities i
      where i.user_id = auth.uid()
        and i.provider = 'google'
    )
  );

drop policy if exists "insights_jobs_select_own" on public.insights_jobs;
create policy "insights_jobs_select_own" on public.insights_jobs
  for select
  to authenticated
  using (
    user_id in (
      select i.provider_id
      from auth.identities i
      where i.user_id = auth.uid()
        and i.provider = 'google'
    )
  );

-- Broadcast row changes to authenticated subscribers (configure Realtime in project if needed).
alter publication supabase_realtime add table public.prospects;
alter publication supabase_realtime add table public.demo_jobs;
alter publication supabase_realtime add table public.gbp_jobs;
alter publication supabase_realtime add table public.insights_jobs;
