-- Supabase Realtime: UPDATE payloads need old row values for filters and clients.
-- DEFAULT replica identity can omit old.status in postgres_changes; set FULL for job tables.
alter table public.demo_jobs replica identity full;
alter table public.gbp_jobs replica identity full;
alter table public.insights_jobs replica identity full;
