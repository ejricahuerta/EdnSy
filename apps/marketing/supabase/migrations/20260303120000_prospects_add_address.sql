-- Add address to prospects for GBP backfill and display (optional).
alter table public.prospects
  add column if not exists address text;

comment on column public.prospects.address is 'Formatted address; backfilled from GBP when available.';
