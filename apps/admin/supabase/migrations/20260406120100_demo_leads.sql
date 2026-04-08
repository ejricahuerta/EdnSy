-- Leads submitted from Stitch-generated demo hero forms (POST /api/demo/lead).

create table if not exists public.demo_leads (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  message text,
  ip_address text,
  created_at timestamptz default now()
);

comment on table public.demo_leads is 'Visitor submissions from demo page lead capture forms';

create index if not exists idx_demo_leads_prospect_created on public.demo_leads (prospect_id, created_at desc);

alter table public.demo_leads enable row level security;

drop policy if exists "Allow service access to demo_leads" on public.demo_leads;
create policy "Allow service access to demo_leads"
  on public.demo_leads for all using (true) with check (true);
