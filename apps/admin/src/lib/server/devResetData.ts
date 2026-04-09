import { getSupabaseDbSchemaServer } from '$lib/server/dbSchemaEnv';
import { getSupabaseAdmin } from '$lib/server/supabase';

const JOB_TABLES = ['apify_jobs', 'demo_jobs', 'gbp_jobs', 'insights_jobs'] as const;

/**
 * Deletes all rows from job queue tables, then prospects, in the active PostgREST schema.
 * Only allowed when `SUPABASE_DB_SCHEMA=dev` (see getSupabaseDbSchemaServer).
 */
export async function resetProspectsAndJobsForDevSchema(): Promise<
	{ ok: true } | { ok: false; httpStatus: 403 | 500; message: string }
> {
	if (getSupabaseDbSchemaServer() !== 'dev') {
		return {
			ok: false,
			httpStatus: 403,
			message: 'Reset is only allowed when using the dev database schema.'
		};
	}

	const supabase = getSupabaseAdmin();
	if (!supabase) {
		return {
			ok: false,
			httpStatus: 500,
			message: 'Server database client is not configured.'
		};
	}

	for (const table of JOB_TABLES) {
		const { error } = await supabase.from(table).delete().not('id', 'is', null);
		if (error) {
			return { ok: false, httpStatus: 500, message: `${table}: ${error.message}` };
		}
	}

	const { error: prospectsError } = await supabase.from('prospects').delete().not('id', 'is', null);
	if (prospectsError) {
		return { ok: false, httpStatus: 500, message: `prospects: ${prospectsError.message}` };
	}

	return { ok: true };
}
