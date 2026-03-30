-- Background queue for demo creation (avoids blocking on DataForSEO polling).
-- Status: pending (queued), creating (worker picked it up), done, failed.

create table if not exists public.demo_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  prospect_id uuid not null,
  status text not null default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  demo_link text,
  error_message text
);

comment on column public.demo_jobs.status is 'pending | creating | done | failed';

create index if not exists idx_demo_jobs_user_id on public.demo_jobs (user_id);
create index if not exists idx_demo_jobs_status_created on public.demo_jobs (status, created_at) where status = 'pending';
