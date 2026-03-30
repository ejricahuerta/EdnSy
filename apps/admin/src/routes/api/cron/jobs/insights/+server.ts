import type { RequestHandler } from './$types';
import { processOneInsightsJob } from '$lib/server/demo';
import {
	resetStaleRunningInsightsJobs,
	getInsightsJobQueueCounts
} from '$lib/server/supabase';
import { env } from '$env/dynamic/private';
import { apiError, apiSuccess } from '$lib/server/apiResponse';
import { serverError } from '$lib/server/logger';

const MAX_JOBS_PER_RUN = 20;

/**
 * GET /api/cron/jobs/insights — Cron: process pending insights jobs. Secured by CRON_SECRET.
 */
export const GET: RequestHandler = async ({ request }) => {
	const authHeader = request.headers.get('authorization');
	const secret = (env.CRON_SECRET ?? '').trim();
	if (!secret || authHeader !== `Bearer ${secret}`) {
		return apiError(401, 'Unauthorized');
	}

	await resetStaleRunningInsightsJobs(2);

	let processed = 0;
	let last: Awaited<ReturnType<typeof processOneInsightsJob>> = { processed: false };

	while (processed < MAX_JOBS_PER_RUN) {
		const result = await processOneInsightsJob();
		last = result;
		if (!result.processed) break;
		processed++;
		if (result.status === 'failed') {
			serverError('cron/jobs/insights', 'failed', result);
		}
	}

	const out: Record<string, unknown> = { ...last, processedCount: processed };
	if (processed === 0) {
		const queue = await getInsightsJobQueueCounts();
		if (queue) out.queueStatus = queue;
		else out.queueStatus = 'supabase_unavailable';
	}
	return apiSuccess(out);
};
