-- Allow 'gbp' provider for prospects created by the GBP dental pull script (Toronto/GTA).
alter table public.prospects
  drop constraint if exists prospects_provider_check;

alter table public.prospects
  add constraint prospects_provider_check
  check (provider in ('notion', 'hubspot', 'gohighlevel', 'pipedrive', 'manual', 'gbp'));

comment on column public.prospects.provider is 'Source: notion | hubspot | gohighlevel | pipedrive | manual | gbp (script-pulled from Places API)';
 