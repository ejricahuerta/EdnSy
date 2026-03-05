-- Monthly usage counter for Google Places API (Text Search + Place Details).
-- Used to enforce limit (e.g. 10k lookups/month) so we stay within free tier.
create table if not exists public.places_api_usage (
  month_key text primary key,
  lookups_count int not null default 0
);

comment on table public.places_api_usage is 'Places API lookups per month; app blocks new requests when lookups_count >= limit (env PLACES_API_MONTHLY_LIMIT).';

-- Atomic: increment count for month only if under limit. Returns new count or 0 if at limit.
create or replace function public.increment_places_usage_if_under_limit(p_month_key text, p_limit int)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count int;
begin
  insert into public.places_api_usage (month_key, lookups_count)
  values (p_month_key, 0)
  on conflict (month_key) do nothing;

  update public.places_api_usage
  set lookups_count = lookups_count + 1
  where month_key = p_month_key and lookups_count < p_limit
  returning lookups_count into new_count;

  return coalesce(new_count, 0);
end;
$$;
