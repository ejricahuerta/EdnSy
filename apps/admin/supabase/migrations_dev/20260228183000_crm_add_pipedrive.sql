-- Twin of supabase/migrations/20260228183000_crm_add_pipedrive.sql targeting schema dev.
-- Regenerate: pnpm run db:sync-migrations-dev
-- Apply: pnpm run db:push:dev (with SUPABASE_DATABASE_URL)

-- Add Pipedrive to CRM provider enum (alter check constraint).
-- Include 'notion' so existing rows (Notion is stored in crm_connections in this app) do not violate.

alter table dev.crm_connections drop constraint if exists crm_connections_provider_check;
alter table dev.crm_connections add constraint crm_connections_provider_check
  check (provider in ('hubspot', 'gohighlevel', 'pipedrive', 'notion'));

comment on column dev.crm_connections.provider is 'hubspot | gohighlevel | pipedrive | notion';
