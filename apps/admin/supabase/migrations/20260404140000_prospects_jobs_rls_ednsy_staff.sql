-- Internal admin: authenticated users whose JWT email ends with @ednsy.com can SELECT all prospects and job rows (shared workspace).
-- Replaces per-Google-sub ownership filter used for multi-tenant customers.

drop policy if exists "prospects_select_own" on public.prospects;
drop policy if exists "prospects_select_ednsy_staff" on public.prospects;

create policy "prospects_select_ednsy_staff" on public.prospects
  for select
  to authenticated
  using (
    (auth.jwt() ->> 'email') is not null
    and split_part(lower(trim(auth.jwt() ->> 'email')), '@', 2) = 'ednsy.com'
  );

drop policy if exists "demo_jobs_select_own" on public.demo_jobs;
drop policy if exists "demo_jobs_select_ednsy_staff" on public.demo_jobs;
create policy "demo_jobs_select_ednsy_staff" on public.demo_jobs
  for select
  to authenticated
  using (
    (auth.jwt() ->> 'email') is not null
    and split_part(lower(trim(auth.jwt() ->> 'email')), '@', 2) = 'ednsy.com'
  );

drop policy if exists "gbp_jobs_select_own" on public.gbp_jobs;
drop policy if exists "gbp_jobs_select_ednsy_staff" on public.gbp_jobs;
create policy "gbp_jobs_select_ednsy_staff" on public.gbp_jobs
  for select
  to authenticated
  using (
    (auth.jwt() ->> 'email') is not null
    and split_part(lower(trim(auth.jwt() ->> 'email')), '@', 2) = 'ednsy.com'
  );

drop policy if exists "insights_jobs_select_own" on public.insights_jobs;
drop policy if exists "insights_jobs_select_ednsy_staff" on public.insights_jobs;
create policy "insights_jobs_select_ednsy_staff" on public.insights_jobs
  for select
  to authenticated
  using (
    (auth.jwt() ->> 'email') is not null
    and split_part(lower(trim(auth.jwt() ->> 'email')), '@', 2) = 'ednsy.com'
  );
