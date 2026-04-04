-- Twin of supabase/migrations/20260404140000_prospects_jobs_rls_ednsy_staff.sql targeting schema dev.
-- Regenerate: pnpm run db:sync-migrations-dev
-- Apply: pnpm run db:push:dev (with SUPABASE_DATABASE_URL)

-- Internal admin: authenticated users whose JWT email ends with @ednsy.com can SELECT all prospects and job rows (shared workspace).
-- Replaces per-Google-sub ownership filter used for multi-tenant customers.

drop policy if exists "prospects_select_own" on dev.prospects;
drop policy if exists "prospects_select_ednsy_staff" on dev.prospects;

create policy "prospects_select_ednsy_staff" on dev.prospects
  for select
  to authenticated
  using (
    (auth.jwt() ->> 'email') is not null
    and split_part(lower(trim(auth.jwt() ->> 'email')), '@', 2) = 'ednsy.com'
  );

drop policy if exists "demo_jobs_select_own" on dev.demo_jobs;
drop policy if exists "demo_jobs_select_ednsy_staff" on dev.demo_jobs;
create policy "demo_jobs_select_ednsy_staff" on dev.demo_jobs
  for select
  to authenticated
  using (
    (auth.jwt() ->> 'email') is not null
    and split_part(lower(trim(auth.jwt() ->> 'email')), '@', 2) = 'ednsy.com'
  );

drop policy if exists "gbp_jobs_select_own" on dev.gbp_jobs;
drop policy if exists "gbp_jobs_select_ednsy_staff" on dev.gbp_jobs;
create policy "gbp_jobs_select_ednsy_staff" on dev.gbp_jobs
  for select
  to authenticated
  using (
    (auth.jwt() ->> 'email') is not null
    and split_part(lower(trim(auth.jwt() ->> 'email')), '@', 2) = 'ednsy.com'
  );

drop policy if exists "insights_jobs_select_own" on dev.insights_jobs;
drop policy if exists "insights_jobs_select_ednsy_staff" on dev.insights_jobs;
create policy "insights_jobs_select_ednsy_staff" on dev.insights_jobs
  for select
  to authenticated
  using (
    (auth.jwt() ->> 'email') is not null
    and split_part(lower(trim(auth.jwt() ->> 'email')), '@', 2) = 'ednsy.com'
  );
