import type { RequestHandler } from './$types';
import { getDashboardSessionUser } from '$lib/server/authDashboard';
import { processOneApifyJob } from '$lib/server/demo';
import { apiError, apiSuccess } from '$lib/server/apiResponse';
import { serverError } from '$lib/server/logger';
import { resetStaleRunningApifyJobs } from '$lib/server/supabase';

/**
 * Process one pending Apify import job.
 * POST /api/jobs/apify
 */
export const POST: RequestHandler = async (event) => {
	const user = await getDashboardSessionUser(event);
	if (!user) {
		return apiError(401, 'Sign in required');
	}

	await resetStaleRunningApifyJobs(10);

	const result = await processOneApifyJob();
	if (result.processed && result.status === 'failed') {
		serverError('jobs/apify', 'failed', result);
	}

	return apiSuccess({ ...result });
};
