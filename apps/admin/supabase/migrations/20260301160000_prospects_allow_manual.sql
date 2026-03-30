-- Allow 'manual' provider so users can add test prospects from the dashboard without connecting a CRM (e.g. to send one demo).
alter table public.prospects
  drop constraint if exists prospects_provider_check;

alter table public.prospects
  add constraint prospects_provider_check
  check (provider in ('notion', 'hubspot', 'gohighlevel', 'pipedrive', 'manual'));

comment on column public.prospects.provider is 'Source: notion | hubspot | gohighlevel | pipedrive | manual (added from dashboard)';
