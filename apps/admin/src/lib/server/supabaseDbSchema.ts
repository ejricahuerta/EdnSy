import { env } from '$env/dynamic/private';

const SCHEMA_IDENT = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

let warnedInvalidSchema = false;

/**
 * Postgres schema for PostgREST table/RPC access (server-side env only).
 * Set `SUPABASE_DB_SCHEMA` in `.env` (default `public`). Use `dev` for a parallel dev schema on the same project.
 */
export function getSupabaseDbSchema(): string {
	const raw = (env.SUPABASE_DB_SCHEMA ?? '').trim() || 'public';
	if (!SCHEMA_IDENT.test(raw)) {
		if (!warnedInvalidSchema) {
			console.warn(
				`[supabase] Invalid SUPABASE_DB_SCHEMA "${raw}"; use a single Postgres identifier. Falling back to public.`
			);
			warnedInvalidSchema = true;
		}
		return 'public';
	}
	return raw;
}

/** Options to pass into `createClient` / `createServerClient` for DB schema selection. */
export function getSupabaseDbClientOptions() {
	return { db: { schema: getSupabaseDbSchema() } } as const;
}
