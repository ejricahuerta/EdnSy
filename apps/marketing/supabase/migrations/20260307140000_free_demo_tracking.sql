-- Tracking funnel for free demos: creation -> email_sent -> link_clicked -> demo_viewed

alter table public.free_demo_requests
  add column if not exists email_sent_at timestamptz,
  add column if not exists link_clicked_at timestamptz,
  add column if not exists demo_viewed_at timestamptz;

comment on column public.free_demo_requests.email_sent_at is 'When the "check your email" link was sent (try form submit).';
comment on column public.free_demo_requests.link_clicked_at is 'When the user clicked the demo link in the email (via /api/demo/click).';
comment on column public.free_demo_requests.demo_viewed_at is 'When the user first loaded the demo page (status=done).';
