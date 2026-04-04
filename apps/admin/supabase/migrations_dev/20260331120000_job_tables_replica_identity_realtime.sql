-- Twin of supabase/migrations/20260331120000_job_tables_replica_identity_realtime.sql targeting schema dev.
-- Regenerate: pnpm run db:sync-migrations-dev
-- Apply: pnpm run db:push:dev (with SUPABASE_DATABASE_URL)

-- Supabase Realtime: UPDATE payloads need old row values for filters and clients.
-- DEFAULT replica identity can omit old.status in postgres_changes; set FULL for job tables.
alter table dev.demo_jobs replica identity full;
alter table dev.gbp_jobs replica identity full;
alter table dev.insights_jobs replica identity full;
