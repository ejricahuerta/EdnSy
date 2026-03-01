-- Subscriptions: link session user_id to Stripe and plan tier.
-- user_id = our app user id (e.g. Google sub from session).
-- One row per user; updated by Stripe webhooks.

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan_tier text not null default 'starter',
  status text not null default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on column public.subscriptions.user_id is 'App user id (e.g. Google sub from session)';
comment on column public.subscriptions.plan_tier is 'starter | pro | teams (Agency)';
comment on column public.subscriptions.status is 'active | canceled | past_due | etc.';

create index if not exists idx_subscriptions_user_id on public.subscriptions (user_id);
create index if not exists idx_subscriptions_stripe_customer on public.subscriptions (stripe_customer_id);
create index if not exists idx_subscriptions_stripe_sub on public.subscriptions (stripe_subscription_id);
