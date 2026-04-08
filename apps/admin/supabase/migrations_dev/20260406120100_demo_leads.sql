-- Twin of supabase/migrations/20260406120100_demo_leads.sql targeting schema dev.
-- Regenerate: pnpm run db:sync-migrations-dev
-- Apply: pnpm run db:push:dev (with SUPABASE_DATABASE_URL)

-- Leads submitted from Stitch-generated demo hero forms (POST /api/demo/lead).

create table if not exists dev.demo_leads (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references dev.prospects(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  message text,
  ip_address text,
  created_at timestamptz default now()
);

comment on table dev.demo_leads is 'Visitor submissions from demo page lead capture forms';

create index if not exists idx_demo_leads_prospect_created on dev.demo_leads (prospect_id, created_at desc);

alter table dev.demo_leads enable row level security;

drop policy if exists "Allow service access to demo_leads" on dev.demo_leads;
create policy "Allow service access to demo_leads"
  on dev.demo_leads for all using (true) with check (true);
