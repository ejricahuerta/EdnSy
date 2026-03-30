-- Add opened_at and clicked_at for F5 open/click tracking.
alter table public.demo_tracking
  add column if not exists opened_at timestamptz,
  add column if not exists clicked_at timestamptz;

comment on column public.demo_tracking.opened_at is 'When the prospect opened the email (pixel load)';
comment on column public.demo_tracking.clicked_at is 'When the prospect clicked the demo link';

-- Status progression: draft -> approved -> sent -> opened -> clicked -> replied
comment on column public.demo_tracking.status is 'draft | approved | sent | opened | clicked | replied';
