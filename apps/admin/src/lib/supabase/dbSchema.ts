import { env } from '$env/dynamic/public';

const allowed = new Set(['public', 'dev']);

export function parseSupabaseDbSchema(raw: string | undefined | null): 'public' | 'dev' {
	const s = (raw ?? '').trim().toLowerCase();
	if (allowed.has(s)) return s as 'public' | 'dev';
	return 'public';
}

/**
 * Client-side schema from PUBLIC_* only. For SSR, prefer layout `supabaseDbSchema` from
 * `getSupabaseDbSchemaServer()` so `SUPABASE_DB_SCHEMA` applies without exposing it.
 */
export function getSupabaseDbSchema(): 'public' | 'dev' {
	return parseSupabaseDbSchema(env.PUBLIC_SUPABASE_DB_SCHEMA);
}
