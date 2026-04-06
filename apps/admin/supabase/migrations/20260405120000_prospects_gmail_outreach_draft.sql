-- Gmail CRM outreach: store active draft id on prospect (demo + alternate paths).

alter table public.prospects
  add column if not exists gmail_outreach_draft_id text,
  add column if not exists gmail_outreach_draft_kind text,
  add column if not exists gmail_outreach_draft_created_at timestamptz;

comment on column public.prospects.gmail_outreach_draft_id is 'Gmail API draft id for unsent CRM outreach; cleared after drafts.send';
comment on column public.prospects.gmail_outreach_draft_kind is 'demo | alternate — which template the draft used';
comment on column public.prospects.gmail_outreach_draft_created_at is 'When the current draft was created in Gmail';
