-- Consolidated migration: prospects address, user_settings, crm Notion consolidation, prospects flagged.
-- Replaces: prospects_add_address, user_settings, crm_add_notion_drop_notion_table, prospects_flagged_out_of_scope.

-- 1. Prospects: add address (GBP backfill and display).
alter table public.prospects
  add column if not exists address text;

comment on column public.prospects.address is 'Formatted address; backfilled from GBP when available.';

-- 2. Prospects: add flagged / flagged_reason (out-of-scope).
alter table public.prospects
  add column if not exists flagged boolean not null default false,
  add column if not exists flagged_reason text;

comment on column public.prospects.flagged is 'When true, demos, GBP lookup, and send are disabled; row can be deleted.';
comment on column public.prospects.flagged_reason is 'Optional reason (e.g. "Out of scope (large enterprise)").';

create index if not exists idx_prospects_flagged on public.prospects (user_id, flagged) where flagged = true;

-- 3. User settings (per-user key-value, e.g. CRM industry filter).
create table if not exists public.user_settings (
  user_id text not null,
  key text not null,
  value jsonb not null default '{}',
  updated_at timestamptz default now(),
  primary key (user_id, key)
);

comment on table public.user_settings is 'Per-user app settings (e.g. crm_industry_filter).';
comment on column public.user_settings.key is 'Setting key, e.g. crm_industry_filter.';
comment on column public.user_settings.value is 'JSON value; for crm_industry_filter: array of industry slugs.';

create index if not exists idx_user_settings_user_id on public.user_settings (user_id);

alter table public.user_settings enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_settings' and policyname = 'Users can manage own user_settings'
  ) then
    create policy "Users can manage own user_settings"
      on public.user_settings
      for all
      using (true)
      with check (true);
  end if;
end $$;

-- 4. CRM: add Notion to crm_connections, migrate notion_connections, drop notion_connections.
alter table public.crm_connections
  add column if not exists provider_metadata jsonb default null;

comment on column public.crm_connections.provider_metadata is 'Provider-specific config, e.g. {"databaseId": "..."} for Notion';

alter table public.crm_connections drop constraint if exists crm_connections_provider_check;
alter table public.crm_connections add constraint crm_connections_provider_check
  check (provider in ('hubspot', 'gohighlevel', 'pipedrive', 'notion'));

comment on column public.crm_connections.provider is 'hubspot | gohighlevel | pipedrive | notion';

do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'notion_connections') then
    insert into public.crm_connections (user_id, provider, access_token, provider_metadata, created_at, updated_at)
    select
      user_id,
      'notion',
      api_key,
      jsonb_build_object('databaseId', database_id),
      created_at,
      updated_at
    from public.notion_connections
    on conflict (user_id, provider) do update set
      access_token = excluded.access_token,
      provider_metadata = excluded.provider_metadata,
      updated_at = excluded.updated_at;
    drop table public.notion_connections;
  end if;
end $$;
