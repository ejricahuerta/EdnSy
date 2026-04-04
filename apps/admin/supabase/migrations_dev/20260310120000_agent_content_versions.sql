-- Twin of supabase/migrations/20260310120000_agent_content_versions.sql targeting schema dev.
-- Regenerate: pnpm run db:sync-migrations-dev
-- Apply: pnpm run db:push:dev (with SUPABASE_DATABASE_URL)

-- Versioned prompts and knowledge base for AI agents (Design, Demo Chat, Demo Creation).
-- App uses default from code; optional override = latest row per (agent_id, content_type, key).

create table if not exists dev.agent_content_versions (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null,
  content_type text not null,
  key text not null,
  body text not null,
  version int not null,
  created_at timestamptz not null default now(),
  constraint agent_content_versions_type check (content_type in ('prompt', 'knowledge_base')),
  constraint agent_content_versions_agent check (agent_id in ('design', 'demo-chat', 'demo-creation'))
);

comment on table dev.agent_content_versions is 'Versioned prompt and knowledge_base overrides for AI agents; default remains in code.';
comment on column dev.agent_content_versions.agent_id is 'design | demo-chat | demo-creation';
comment on column dev.agent_content_versions.content_type is 'prompt | knowledge_base';
comment on column dev.agent_content_versions.key is 'E.g. tone_selection, system_instruction, audit, audit_modal_copy, tone_guidance, chat_kb, demo_kb';
comment on column dev.agent_content_versions.version is 'Incrementing version per (agent_id, content_type, key).';

create index if not exists idx_agent_content_versions_latest
  on dev.agent_content_versions (agent_id, content_type, key, version desc);

alter table dev.agent_content_versions enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'dev'
      and tablename = 'agent_content_versions'
      and policyname = 'Service role full access to agent_content_versions'
  ) then
    create policy "Service role full access to agent_content_versions"
      on dev.agent_content_versions for all using (true) with check (true);
  end if;
end
$$;
