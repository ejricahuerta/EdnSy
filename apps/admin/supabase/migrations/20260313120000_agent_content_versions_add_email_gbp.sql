-- Allow new agent_id values (email, gbp) for dashboard-editable agents.
-- Existing rows (design, demo-chat, demo-creation) remain valid.

alter table public.agent_content_versions
  drop constraint if exists agent_content_versions_agent;

alter table public.agent_content_versions
  add constraint agent_content_versions_agent
  check (agent_id in ('design', 'demo-chat', 'demo-creation', 'email', 'gbp'));

comment on column public.agent_content_versions.agent_id is 'design | demo-chat | demo-creation | email | gbp';
