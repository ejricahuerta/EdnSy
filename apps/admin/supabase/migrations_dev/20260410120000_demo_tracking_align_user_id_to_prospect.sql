-- Twin of supabase/migrations/20260410120000_demo_tracking_align_user_id_to_prospect.sql targeting schema dev.
-- Regenerate: pnpm run db:sync-migrations-dev
-- Apply: pnpm run db:push:dev (with SUPABASE_DATABASE_URL)

update dev.demo_tracking as dt
set
  user_id = p.user_id,
  updated_at = now()
from dev.prospects as p
where
  dt.prospect_id is not null
  and dt.prospect_id = p.id
  and dt.user_id is distinct from p.user_id
  and not exists (
    select 1
    from dev.demo_tracking dt2
    where
      dt2.id <> dt.id
      and dt2.user_id = p.user_id
      and dt2.crm_source = dt.crm_source
      and dt2.crm_prospect_id = dt.crm_prospect_id
  );
