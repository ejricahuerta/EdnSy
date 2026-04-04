-- Twin of supabase/migrations/20260305120000_insights_jobs.sql targeting schema dev.
-- Regenerate: pnpm run db:sync-migrations-dev
-- Apply: pnpm run db:push:dev (with SUPABASE_DATABASE_URL)

-- Background queue for "Pull insights" (GBP + AI analysis). User can navigate away while job runs.
-- Status: pending (queued), running (worker picked it up), done, failed.

create table if not exists dev.insights_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  prospect_id uuid not null,
  status text not null default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  error_message text
);

comment on column dev.insights_jobs.status is 'pending | running | done | failed';

create index if not exists idx_insights_jobs_user_id on dev.insights_jobs (user_id);
create index if not exists idx_insights_jobs_status_created on dev.insights_jobs (status, created_at) where status = 'pending';
