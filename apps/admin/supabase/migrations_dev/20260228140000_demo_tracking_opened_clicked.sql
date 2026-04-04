-- Twin of supabase/migrations/20260228140000_demo_tracking_opened_clicked.sql targeting schema dev.
-- Regenerate: pnpm run db:sync-migrations-dev
-- Apply: pnpm run db:push:dev (with SUPABASE_DATABASE_URL)

-- Add opened_at and clicked_at for F5 open/click tracking.
alter table dev.demo_tracking
  add column if not exists opened_at timestamptz,
  add column if not exists clicked_at timestamptz;

comment on column dev.demo_tracking.opened_at is 'When the prospect opened the email (pixel load)';
comment on column dev.demo_tracking.clicked_at is 'When the prospect clicked the demo link';

-- Status progression: draft -> approved -> sent -> opened -> clicked -> replied
comment on column dev.demo_tracking.status is 'draft | approved | sent | opened | clicked | replied';
