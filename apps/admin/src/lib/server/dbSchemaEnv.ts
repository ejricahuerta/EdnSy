import { getSupabaseDbSchema } from '$lib/server/supabaseDbSchema';

/**
 * Server-only PostgREST schema for SSR and service client.
 * Reads private `SUPABASE_DB_SCHEMA` (see supabaseDbSchema.ts).
 */
export function getSupabaseDbSchemaServer(): 'public' | 'dev' {
	const s = getSupabaseDbSchema();
	return s === 'dev' ? 'dev' : 'public';
}
