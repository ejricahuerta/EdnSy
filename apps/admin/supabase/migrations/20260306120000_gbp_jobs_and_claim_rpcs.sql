-- GBP-only queue (separate from insights). Status: pending | running | done | failed.
create table if not exists public.gbp_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  prospect_id uuid not null,
  status text not null default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  error_message text
);

comment on column public.gbp_jobs.status is 'pending | running | done | failed';

create index if not exists idx_gbp_jobs_user_id on public.gbp_jobs (user_id);
create index if not exists idx_gbp_jobs_status_created on public.gbp_jobs (status, created_at) where status = 'pending';

-- Atomic claim: one pending job per caller. Uses FOR UPDATE SKIP LOCKED so concurrent callers get different rows.
create or replace function public.claim_next_pending_gbp_job()
returns setof public.gbp_jobs
language sql
security definer
set search_path = public
as $$
  update public.gbp_jobs
  set status = 'running', updated_at = now()
  where id = (
    select id from public.gbp_jobs
    where status = 'pending'
    order by created_at asc
    limit 1
    for update skip locked
  )
  returning *;
$$;

create or replace function public.claim_next_pending_insights_job()
returns setof public.insights_jobs
language sql
security definer
set search_path = public
as $$
  update public.insights_jobs
  set status = 'running', updated_at = now()
  where id = (
    select id from public.insights_jobs
    where status = 'pending'
    order by created_at asc
    limit 1
    for update skip locked
  )
  returning *;
$$;

create or replace function public.claim_next_pending_demo_job()
returns setof public.demo_jobs
language sql
security definer
set search_path = public
as $$
  update public.demo_jobs
  set status = 'creating', updated_at = now()
  where id = (
    select id from public.demo_jobs
    where status = 'pending'
    order by created_at asc
    limit 1
    for update skip locked
  )
  returning *;
$$;
