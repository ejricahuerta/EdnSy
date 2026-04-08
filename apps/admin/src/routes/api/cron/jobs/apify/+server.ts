import type { RequestHandler } from './$types';
import { processOneApifyJob } from '$lib/server/demo';
import { resetStaleRunningApifyJobs, getApifyJobQueueCounts } from '$lib/server/supabase';
import { env } from '$env/dynamic/private';
import { apiError, apiSuccess } from '$lib/server/apiResponse';
import { serverError } from '$lib/server/logger';

const MAX_JOBS_PER_RUN = 5;

/**
 * GET /api/cron/jobs/apify — process pending Apify import jobs. Secured by CRON_SECRET.
 */
export const GET: RequestHandler = async ({ request }) => {
	const authHeader = request.headers.get('authorization');
	const secret = (env.CRON_SECRET ?? '').trim();
	if (!secret || authHeader !== `Bearer ${secret}`) {
		return apiError(401, 'Unauthorized');
	}

	await resetStaleRunningApifyJobs(10);

	let processed = 0;
	let last: Awaited<ReturnType<typeof processOneApifyJob>> = { processed: false };

	while (processed < MAX_JOBS_PER_RUN) {
		const result = await processOneApifyJob();
		last = result;
		if (!result.processed) break;
		processed++;
		if (result.status === 'failed') {
			serverError('cron/jobs/apify', 'failed', result);
		}
	}

	const out: Record<string, unknown> = { ...last, processedCount: processed };
	if (processed === 0) {
		const queue = await getApifyJobQueueCounts();
		if (queue) out.queueStatus = queue;
		else out.queueStatus = 'supabase_unavailable';
	}
	return apiSuccess(out);
};
