-- Twin of supabase/migrations/20260304120000_demo_jobs.sql targeting schema dev.
-- Regenerate: pnpm run db:sync-migrations-dev
-- Apply: pnpm run db:push:dev (with SUPABASE_DATABASE_URL)

-- Background queue for demo creation (avoids blocking on DataForSEO polling).
-- Status: pending (queued), creating (worker picked it up), done, failed.

create table if not exists dev.demo_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  prospect_id uuid not null,
  status text not null default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  demo_link text,
  error_message text
);

comment on column dev.demo_jobs.status is 'pending | creating | done | failed';

create index if not exists idx_demo_jobs_user_id on dev.demo_jobs (user_id);
create index if not exists idx_demo_jobs_status_created on dev.demo_jobs (status, created_at) where status = 'pending';
