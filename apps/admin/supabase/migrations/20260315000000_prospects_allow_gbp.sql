-- Allow 'gbp' provider for prospects created by the GBP dental pull script (Toronto/GTA).
alter table public.prospects
  drop constraint if exists prospects_provider_check;

update public.prospects
set provider = case lower(trim(provider))
    when 'notion' then 'notion'
    when 'hubspot' then 'hubspot'
    when 'gohighlevel' then 'gohighlevel'
    when 'pipedrive' then 'pipedrive'
    when 'manual' then 'manual'
    when 'gbp' then 'gbp'
    else 'manual'
  end;

alter table public.prospects
  add constraint prospects_provider_check
  check (provider in ('notion', 'hubspot', 'gohighlevel', 'pipedrive', 'manual', 'gbp'));

comment on column public.prospects.provider is 'Source: notion | hubspot | gohighlevel | pipedrive | manual | gbp (script-pulled from Places API)';
 