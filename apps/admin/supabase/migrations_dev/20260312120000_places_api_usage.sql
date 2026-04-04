-- Twin of supabase/migrations/20260312120000_places_api_usage.sql targeting schema dev.
-- Regenerate: pnpm run db:sync-migrations-dev
-- Apply: pnpm run db:push:dev (with SUPABASE_DATABASE_URL)

-- Monthly usage counter for Google Places API (Text Search + Place Details).
-- Used to enforce limit (e.g. 10k lookups/month) so we stay within free tier.
create table if not exists dev.places_api_usage (
  month_key text primary key,
  lookups_count int not null default 0
);

comment on table dev.places_api_usage is 'Places API lookups per month; app blocks new requests when lookups_count >= limit (env PLACES_API_MONTHLY_LIMIT).';

-- Atomic: increment count for month only if under limit. Returns new count or 0 if at limit.
create or replace function dev.increment_places_usage_if_under_limit(p_month_key text, p_limit int)
returns int
language plpgsql
security definer
set search_path = dev
as $$
declare
  new_count int;
begin
  insert into dev.places_api_usage (month_key, lookups_count)
  values (p_month_key, 0)
  on conflict (month_key) do nothing;

  update dev.places_api_usage
  set lookups_count = lookups_count + 1
  where month_key = p_month_key and lookups_count < p_limit
  returning lookups_count into new_count;

  return coalesce(new_count, 0);
end;
$$;
