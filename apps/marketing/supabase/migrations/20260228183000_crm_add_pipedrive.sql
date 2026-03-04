-- Add Pipedrive to CRM provider enum (alter check constraint).
-- Include 'notion' so existing rows (Notion is stored in crm_connections in this app) do not violate.

alter table public.crm_connections drop constraint if exists crm_connections_provider_check;
alter table public.crm_connections add constraint crm_connections_provider_check
  check (provider in ('hubspot', 'gohighlevel', 'pipedrive', 'notion'));

comment on column public.crm_connections.provider is 'hubspot | gohighlevel | pipedrive | notion';
