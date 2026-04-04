-- Twin of supabase/migrations/20260330120000_prospects_jobs_rls_realtime.sql targeting schema dev.
-- Regenerate: pnpm run db:sync-migrations-dev
-- Apply: pnpm run db:push:dev (with SUPABASE_DATABASE_URL)

-- Dashboard Realtime: per-user SELECT via Google identity (provider_id = prospects.user_id).
-- Service role (server) bypasses RLS unchanged.

drop policy if exists "Allow service access to prospects" on dev.prospects;
drop policy if exists "prospects_select_own" on dev.prospects;
drop policy if exists "prospects_select_ednsy_staff" on dev.prospects;

create policy "prospects_select_own" on dev.prospects
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

alter table dev.demo_jobs enable row level security;
alter table dev.gbp_jobs enable row level security;
alter table dev.insights_jobs enable row level security;

drop policy if exists "demo_jobs_select_own" on dev.demo_jobs;
drop policy if exists "demo_jobs_select_ednsy_staff" on dev.demo_jobs;
create policy "demo_jobs_select_own" on dev.demo_jobs
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

drop policy if exists "gbp_jobs_select_own" on dev.gbp_jobs;
drop policy if exists "gbp_jobs_select_ednsy_staff" on dev.gbp_jobs;
create policy "gbp_jobs_select_own" on dev.gbp_jobs
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

drop policy if exists "insights_jobs_select_own" on dev.insights_jobs;
drop policy if exists "insights_jobs_select_ednsy_staff" on dev.insights_jobs;
create policy "insights_jobs_select_own" on dev.insights_jobs
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
do $pub$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'dev' and tablename = 'prospects'
  ) then
    execute 'alter publication supabase_realtime add table dev.prospects';
  end if;
end
$pub$;

do $pub$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'dev' and tablename = 'demo_jobs'
  ) then
    execute 'alter publication supabase_realtime add table dev.demo_jobs';
  end if;
end
$pub$;

do $pub$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'dev' and tablename = 'gbp_jobs'
  ) then
    execute 'alter publication supabase_realtime add table dev.gbp_jobs';
  end if;
end
$pub$;

do $pub$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'dev' and tablename = 'insights_jobs'
  ) then
    execute 'alter publication supabase_realtime add table dev.insights_jobs';
  end if;
end
$pub$;
