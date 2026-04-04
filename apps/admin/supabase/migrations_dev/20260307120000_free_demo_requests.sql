-- Twin of supabase/migrations/20260307120000_free_demo_requests.sql targeting schema dev.
-- Regenerate: pnpm run db:sync-migrations-dev
-- Apply: pnpm run db:push:dev (with SUPABASE_DATABASE_URL)

-- Free (try) demo requests: anonymous users submit company + email; we generate demo in background and email the link.
-- Status: pending (queued), creating (worker picked it up), done, failed.

create table if not exists dev.free_demo_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  company_name text not null,
  website text default '',
  industry text not null default 'professional',
  status text not null default 'pending',
  demo_link text,
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on column dev.free_demo_requests.status is 'pending | creating | done | failed';

create index if not exists idx_free_demo_requests_status_created
  on dev.free_demo_requests (status, created_at)
  where status = 'pending';

-- Lookup active request by email + company (normalised) to prevent duplicate in-flight jobs
create index if not exists idx_free_demo_requests_email_company_status
  on dev.free_demo_requests (lower(trim(email)), lower(trim(company_name)), status);
