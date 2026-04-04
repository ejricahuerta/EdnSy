-- Twin of supabase/migrations/20260303100000_consolidated_prospects_user_settings_crm_flagged.sql targeting schema dev.
-- Regenerate: pnpm run db:sync-migrations-dev
-- Apply: pnpm run db:push:dev (with SUPABASE_DATABASE_URL)

-- Consolidated migration: prospects address, user_settings, crm Notion consolidation, prospects flagged.
-- Replaces: prospects_add_address, user_settings, crm_add_notion_drop_notion_table, prospects_flagged_out_of_scope.

-- 1. Prospects: add address (GBP backfill and display).
alter table dev.prospects
  add column if not exists address text;

comment on column dev.prospects.address is 'Formatted address; backfilled from GBP when available.';

-- 2. Prospects: add flagged / flagged_reason (out-of-scope).
alter table dev.prospects
  add column if not exists flagged boolean not null default false,
  add column if not exists flagged_reason text;

comment on column dev.prospects.flagged is 'When true, demos, GBP lookup, and send are disabled; row can be deleted.';
comment on column dev.prospects.flagged_reason is 'Optional reason (e.g. "Out of scope (large enterprise)").';

create index if not exists idx_prospects_flagged on dev.prospects (user_id, flagged) where flagged = true;

-- 3. User settings (per-user key-value, e.g. CRM industry filter).
create table if not exists dev.user_settings (
  user_id text not null,
  key text not null,
  value jsonb not null default '{}',
  updated_at timestamptz default now(),
  primary key (user_id, key)
);

comment on table dev.user_settings is 'Per-user app settings (e.g. crm_industry_filter).';
comment on column dev.user_settings.key is 'Setting key, e.g. crm_industry_filter.';
comment on column dev.user_settings.value is 'JSON value; for crm_industry_filter: array of industry slugs.';

create index if not exists idx_user_settings_user_id on dev.user_settings (user_id);

alter table dev.user_settings enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'dev' and tablename = 'user_settings' and policyname = 'Users can manage own user_settings'
  ) then
    create policy "Users can manage own user_settings"
      on dev.user_settings
      for all
      using (true)
      with check (true);
  end if;
end $$;

-- 4. CRM: add Notion to crm_connections, migrate notion_connections, drop notion_connections.
alter table dev.crm_connections
  add column if not exists provider_metadata jsonb default null;

comment on column dev.crm_connections.provider_metadata is 'Provider-specific config, e.g. {"databaseId": "..."} for Notion';

alter table dev.crm_connections drop constraint if exists crm_connections_provider_check;
alter table dev.crm_connections add constraint crm_connections_provider_check
  check (provider in ('hubspot', 'gohighlevel', 'pipedrive', 'notion'));

comment on column dev.crm_connections.provider is 'hubspot | gohighlevel | pipedrive | notion';

do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'dev' and table_name = 'notion_connections') then
    insert into dev.crm_connections (user_id, provider, access_token, provider_metadata, created_at, updated_at)
    select
      user_id,
      'notion',
      api_key,
      jsonb_build_object('databaseId', database_id),
      created_at,
      updated_at
    from dev.notion_connections
    on conflict (user_id, provider) do update set
      access_token = excluded.access_token,
      provider_metadata = excluded.provider_metadata,
      updated_at = excluded.updated_at;
    drop table dev.notion_connections;
  end if;
end $$;
