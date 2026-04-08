-- Twin of supabase/migrations/20260408120000_apify_jobs_and_provider.sql targeting schema dev.
-- Regenerate: pnpm run db:sync-migrations-dev
-- Apply: pnpm run db:push:dev (with SUPABASE_DATABASE_URL)

-- Apify bulk import queue (Google Maps Scraper). Status: pending | running | done | failed.
create table if not exists dev.apify_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  status text not null default 'pending',
  industry text not null,
  location text not null,
  inserted_count int not null default 0,
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on column dev.apify_jobs.status is 'pending | running | done | failed';

create index if not exists idx_apify_jobs_user_id on dev.apify_jobs (user_id);
create index if not exists idx_apify_jobs_status_created on dev.apify_jobs (status, created_at) where status = 'pending';

-- Atomic claim: one pending job per caller.
create or replace function dev.claim_next_pending_apify_job()
returns setof dev.apify_jobs
language sql
security definer
set search_path = dev
as $$
  update dev.apify_jobs
  set status = 'running', updated_at = now()
  where id = (
    select id from dev.apify_jobs
    where status = 'pending'
    order by created_at asc
    limit 1
    for update skip locked
  )
  returning *;
$$;

alter table dev.apify_jobs enable row level security;

drop policy if exists "apify_jobs_select_own" on dev.apify_jobs;
drop policy if exists "apify_jobs_select_ednsy_staff" on dev.apify_jobs;

create policy "apify_jobs_select_ednsy_staff" on dev.apify_jobs
  for select
  to authenticated
  using (
    (auth.jwt() ->> 'email') is not null
    and split_part(lower(trim(auth.jwt() ->> 'email')), '@', 2) = 'ednsy.com'
  );

do $pub$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'dev' and tablename = 'apify_jobs'
  ) then
    execute 'alter publication supabase_realtime add table dev.apify_jobs';
  end if;
end
$pub$;

alter table dev.apify_jobs replica identity full;

-- Allow prospects sourced from Apify import.
alter table dev.prospects
  drop constraint if exists prospects_provider_check;

update dev.prospects
set provider = case lower(trim(provider))
    when 'notion' then 'notion'
    when 'hubspot' then 'hubspot'
    when 'gohighlevel' then 'gohighlevel'
    when 'pipedrive' then 'pipedrive'
    when 'manual' then 'manual'
    when 'gbp' then 'gbp'
    when 'apify' then 'apify'
    else 'manual'
  end;

alter table dev.prospects
  add constraint prospects_provider_check
  check (provider in ('notion', 'hubspot', 'gohighlevel', 'pipedrive', 'manual', 'gbp', 'apify'));

comment on column dev.prospects.provider is 'Source: notion | hubspot | gohighlevel | pipedrive | manual | gbp | apify';
