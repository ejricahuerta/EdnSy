import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { parseSupabaseDbSchema } from '$lib/supabase/dbSchema';

/** Server-only: `SUPABASE_DB_SCHEMA` overrides `PUBLIC_SUPABASE_DB_SCHEMA`. */
export function getSupabaseDbSchemaServer(): 'public' | 'dev' {
	const raw = (privateEnv.SUPABASE_DB_SCHEMA ?? publicEnv.PUBLIC_SUPABASE_DB_SCHEMA ?? '').trim();
	return parseSupabaseDbSchema(raw);
}
