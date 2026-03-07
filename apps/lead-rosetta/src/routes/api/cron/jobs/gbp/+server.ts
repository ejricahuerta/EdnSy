import type { RequestHandler } from './$types';
import { processOneGbpJob } from '$lib/server/demo';
import { resetStaleRunningGbpJobs, getGbpJobQueueCounts } from '$lib/server/supabase';
import { env } from '$env/dynamic/private';
import { apiError, apiSuccess } from '$lib/server/apiResponse';
import { serverError } from '$lib/server/logger';

const MAX_JOBS_PER_RUN = 20;

/**
 * GET /api/cron/jobs/gbp — Cron: process pending GBP jobs. Secured by CRON_SECRET.
 */
export const GET: RequestHandler = async ({ request }) => {
	const authHeader = request.headers.get('authorization');
	const secret = (env.CRON_SECRET ?? '').trim();
	if (!secret || authHeader !== `Bearer ${secret}`) {
		return apiError(401, 'Unauthorized');
	}

	await resetStaleRunningGbpJobs(2);

	let processed = 0;
	let last: Awaited<ReturnType<typeof processOneGbpJob>> = { processed: false };

	while (processed < MAX_JOBS_PER_RUN) {
		const result = await processOneGbpJob();
		last = result;
		if (!result.processed) break;
		processed++;
		if (result.status === 'failed') {
			serverError('cron/jobs/gbp', 'failed', result);
		}
	}

	const out: Record<string, unknown> = { ...last, processedCount: processed };
	if (processed === 0) {
		const queue = await getGbpJobQueueCounts();
		if (queue) out.queueStatus = queue;
		else out.queueStatus = 'supabase_unavailable';
	}
	return apiSuccess(out);
};
