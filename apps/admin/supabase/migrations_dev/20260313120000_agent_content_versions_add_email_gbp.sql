-- Twin of supabase/migrations/20260313120000_agent_content_versions_add_email_gbp.sql targeting schema dev.
-- Regenerate: pnpm run db:sync-migrations-dev
-- Apply: pnpm run db:push:dev (with SUPABASE_DATABASE_URL)

-- Allow new agent_id values (email, gbp) for dashboard-editable agents.
-- Existing rows (design, demo-chat, demo-creation) remain valid.

alter table dev.agent_content_versions
  drop constraint if exists agent_content_versions_agent;

alter table dev.agent_content_versions
  add constraint agent_content_versions_agent
  check (agent_id in ('design', 'demo-chat', 'demo-creation', 'email', 'gbp'));

comment on column dev.agent_content_versions.agent_id is 'design | demo-chat | demo-creation | email | gbp';
