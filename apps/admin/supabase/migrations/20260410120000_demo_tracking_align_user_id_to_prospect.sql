-- Align demo_tracking.user_id with prospects.user_id when linked by prospect_id.
-- Fixes rows created under a teammate's session while the prospect owner differs (shared Ed & Sy dashboard).
-- Skips updates that would violate unique (user_id, crm_source, crm_prospect_id) on another row.

update public.demo_tracking as dt
set
  user_id = p.user_id,
  updated_at = now()
from public.prospects as p
where
  dt.prospect_id is not null
  and dt.prospect_id = p.id
  and dt.user_id is distinct from p.user_id
  and not exists (
    select 1
    from public.demo_tracking dt2
    where
      dt2.id <> dt.id
      and dt2.user_id = p.user_id
      and dt2.crm_source = dt.crm_source
      and dt2.crm_prospect_id = dt.crm_prospect_id
  );
