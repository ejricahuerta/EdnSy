import type { RequestHandler } from './$types';
import { getDashboardSessionUser } from '$lib/server/authDashboard';
import { processOneDemoJob } from '$lib/server/demo';
import { getOriginForOutgoingLinks } from '$lib/server/send';
import { apiError, apiSuccess } from '$lib/server/apiResponse';
import { serverError } from '$lib/server/logger';
import { tryAcquireDemoLock, releaseDemoLock } from '$lib/server/demoJobLock';
import { isDemoCurrentlyInProgress } from '$lib/server/supabase';
import { resetStaleDemoJobsCreatingToPending } from '$lib/server/resetStaleDemoJobs';

/**
 * Process one pending demo job from the queue.
 * POST /api/jobs/demo — run one demo job. Requires session (dashboard user).
 * Only one demo runs at a time (in-memory lock + DB check) to avoid Claude rate limits.
 * Resets stale `creating` rows, then skips if a demo is already in progress (handles restarts/disconnects).
 */
export const POST: RequestHandler = async (event) => {
	const { cookies, url } = event;
	const user = await getDashboardSessionUser(event);
	if (!user) {
		return apiError(401, 'Sign in required');
	}

	if (!tryAcquireDemoLock()) {
		return apiSuccess({ processed: false });
	}
	try {
		await resetStaleDemoJobsCreatingToPending();
		if (await isDemoCurrentlyInProgress()) {
			releaseDemoLock();
			return apiSuccess({ processed: false });
		}
		const origin = getOriginForOutgoingLinks(url.origin);
		const result = await processOneDemoJob(origin);
		if (result.processed && 'status' in result && result.status === 'failed') {
			serverError('jobs/demo', 'failed', result);
		}
		return apiSuccess(result);
	} finally {
		releaseDemoLock();
	}
};
