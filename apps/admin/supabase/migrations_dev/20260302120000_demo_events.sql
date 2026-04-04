-- Twin of supabase/migrations/20260302120000_demo_events.sql targeting schema dev.
-- Regenerate: pnpm run db:sync-migrations-dev
-- Apply: pnpm run db:push:dev (with SUPABASE_DATABASE_URL)

-- Granular demo UX events: chat opened, message sent, callback opened, callback submitted, etc.
-- Keyed by prospect_id (our uuid, or 'demo' for free-try sessions). No RLS for now; restrict by user via demo_tracking join if needed.

create table if not exists dev.demo_events (
  id uuid primary key default gen_random_uuid(),
  prospect_id text not null,
  event_type text not null,
  payload jsonb,
  created_at timestamptz default now()
);

comment on column dev.demo_events.prospect_id is 'Our prospect uuid, or "demo" for free-try flow';
comment on column dev.demo_events.event_type is 'e.g. page_view, time_on_page_2min, chat_opened, chat_message_sent, callback_opened, callback_submitted, callback_success, callback_error';
comment on column dev.demo_events.payload is 'Optional event payload (e.g. message_count, error_code)';

create index if not exists idx_demo_events_prospect_created on dev.demo_events (prospect_id, created_at desc);
create index if not exists idx_demo_events_type_created on dev.demo_events (event_type, created_at desc);
