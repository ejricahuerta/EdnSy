-- Apify bulk import queue (Google Maps Scraper). Status: pending | running | done | failed.
create table if not exists public.apify_jobs (
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

comment on column public.apify_jobs.status is 'pending | running | done | failed';

create index if not exists idx_apify_jobs_user_id on public.apify_jobs (user_id);
create index if not exists idx_apify_jobs_status_created on public.apify_jobs (status, created_at) where status = 'pending';

-- Atomic claim: one pending job per caller.
create or replace function public.claim_next_pending_apify_job()
returns setof public.apify_jobs
language sql
security definer
set search_path = public
as $$
  update public.apify_jobs
  set status = 'running', updated_at = now()
  where id = (
    select id from public.apify_jobs
    where status = 'pending'
    order by created_at asc
    limit 1
    for update skip locked
  )
  returning *;
$$;

alter table public.apify_jobs enable row level security;

drop policy if exists "apify_jobs_select_own" on public.apify_jobs;
drop policy if exists "apify_jobs_select_ednsy_staff" on public.apify_jobs;

create policy "apify_jobs_select_ednsy_staff" on public.apify_jobs
  for select
  to authenticated
  using (
    (auth.jwt() ->> 'email') is not null
    and split_part(lower(trim(auth.jwt() ->> 'email')), '@', 2) = 'ednsy.com'
  );

alter publication supabase_realtime add table public.apify_jobs;
alter table public.apify_jobs replica identity full;

-- Allow prospects sourced from Apify import.
alter table public.prospects
  drop constraint if exists prospects_provider_check;

update public.prospects
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

alter table public.prospects
  add constraint prospects_provider_check
  check (provider in ('notion', 'hubspot', 'gohighlevel', 'pipedrive', 'manual', 'gbp', 'apify'));

comment on column public.prospects.provider is 'Source: notion | hubspot | gohighlevel | pipedrive | manual | gbp | apify';
