const SCHEMA_IDENT = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

let warnedInvalidSchema = false;

/**
 * Postgres schema for PostgREST (optional `SUPABASE_DB_SCHEMA`, default `public`).
 * Server-side / Node only; set in `.env` next to this app.
 */
export function getSupabaseDbSchema() {
	const raw = (process.env.SUPABASE_DB_SCHEMA ?? "").trim() || "public";
	if (!SCHEMA_IDENT.test(raw)) {
		if (!warnedInvalidSchema) {
			console.warn(
				`[website-template] Invalid SUPABASE_DB_SCHEMA "${raw}"; use a single Postgres identifier. Falling back to public.`
			);
			warnedInvalidSchema = true;
		}
		return "public";
	}
	return raw;
}

export function supabaseDbClientOptions() {
	return { auth: { persistSession: false }, db: { schema: getSupabaseDbSchema() } };
}
