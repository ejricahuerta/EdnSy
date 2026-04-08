import type { RequestHandler } from './$types';
import { getDashboardSessionUser } from '$lib/server/authDashboard';
import { processOneApifyJob } from '$lib/server/demo';
import { apiError, apiSuccess } from '$lib/server/apiResponse';
import { serverError } from '$lib/server/logger';

/**
 * Process one pending Apify import job.
 * POST /api/jobs/apify
 */
export const POST: RequestHandler = async (event) => {
	const user = await getDashboardSessionUser(event);
	if (!user) {
		return apiError(401, 'Sign in required');
	}

	const result = await processOneApifyJob();
	if (result.processed && result.status === 'failed') {
		serverError('jobs/apify', 'failed', result);
	}

	return apiSuccess({ ...result });
};
