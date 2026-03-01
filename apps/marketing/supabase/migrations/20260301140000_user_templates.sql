-- Per-user templates: custom demo HTML and email HTML for outreach.
-- When set, these override the default demo content and email body (placeholders replaced at send/render time).

create table if not exists public.user_templates (
  user_id text primary key,
  demo_html text,
  email_html text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.user_templates is 'User-editable demo and email HTML templates; placeholders like {{companyName}}, {{demoLink}}, {{senderName}}';
comment on column public.user_templates.demo_html is 'Custom HTML rendered on demo pages when set; empty = use default industry Svelte template';
comment on column public.user_templates.email_html is 'Custom email body HTML when set; must include {{trackableLink}} and leave room for pixel; legal footer appended by app';

alter table public.user_templates enable row level security;

create policy "Service role full access to user_templates"
  on public.user_templates for all using (true) with check (true);
