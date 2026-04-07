import { DEMO_ERROR } from '$lib/constants/demoErrors';
import { PROSPECT_STATUS } from '$lib/prospectStatus';
import { getSupabaseAdmin, DEMO_PROCESSING_STALE_MINUTES } from '$lib/server/supabase';
import { updateProspectStatus } from '$lib/server/prospects';

/**
 * Paid demo_jobs stuck in `creating` (no callback) for longer than DEMO_PROCESSING_STALE_MINUTES
 * are reset to `pending` and prospects set to demo queued so cron can retry.
 */
export async function resetStaleDemoJobsCreatingToPending(): Promise<number> {
	return resetStaleDemoJobsCreatingToPendingScoped();
}

/** Same as global reset but only rows for this user (dashboard manual action). */
export async function resetStaleDemoJobsCreatingToPendingForUser(userId: string): Promise<number> {
	return resetStaleDemoJobsCreatingToPendingScoped(userId);
}

async function resetStaleDemoJobsCreatingToPendingScoped(userId?: string): Promise<number> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return 0;
	const before = new Date(Date.now() - DEMO_PROCESSING_STALE_MINUTES * 60 * 1000).toISOString();
	const now = new Date().toISOString();

	let q = supabase
		.from('demo_jobs')
		.update({
			status: 'pending',
			updated_at: now,
			error_message: DEMO_ERROR.DEMO_REQUEUED_AFTER_TIMEOUT
		})
		.eq('status', 'creating')
		.lt('updated_at', before);
	if (userId) {
		q = q.eq('user_id', userId);
	}
	const { data, error } = await q.select('id, prospect_id');
	if (error || !data?.length) return 0;

	for (const row of data) {
		const prospectId = row.prospect_id as string | null;
		if (prospectId) {
			await updateProspectStatus(prospectId, PROSPECT_STATUS.DEMO_QUEUED);
		}
	}
	return data.length;
}
