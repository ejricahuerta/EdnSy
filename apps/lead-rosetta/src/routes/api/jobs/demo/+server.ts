import type { RequestHandler } from './$types';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';
import { processOneDemoJob } from '$lib/server/demo';
import { processOneFreeDemoJob } from '$lib/server/processFreeDemoJob';
import { getOriginForOutgoingLinks } from '$lib/server/send';
import { apiError, apiSuccess } from '$lib/server/apiResponse';
import { serverError } from '$lib/server/logger';
import { tryAcquireDemoLock, releaseDemoLock } from '$lib/server/demoJobLock';
import {
	resetStaleFreeDemoCreatingToPending,
	isDemoCurrentlyInProgress
} from '$lib/server/supabase';

/**
 * Process one pending demo job from the queue (paid first, then free try demos).
 * POST /api/jobs/demo — run one demo job. Requires session (dashboard user).
 * Only one demo runs at a time (in-memory lock + DB check) to avoid Claude rate limits.
 * Resets stale 'creating' rows and skips if a demo is already in progress (handles restarts/disconnects).
 */
export const POST: RequestHandler = async ({ cookies, url }) => {
	const cookie = cookies.get(getSessionCookieName());
	const user = await getSessionFromCookie(cookie);
	if (!user) {
		return apiError(401, 'Sign in required');
	}

	if (!tryAcquireDemoLock()) {
		return apiSuccess({ processed: false });
	}
	try {
		await resetStaleFreeDemoCreatingToPending();
		if (await isDemoCurrentlyInProgress()) {
			releaseDemoLock();
			return apiSuccess({ processed: false });
		}
		const origin = getOriginForOutgoingLinks(url.origin);
		let result = await processOneDemoJob(origin);
		if (!result.processed) {
			result = await processOneFreeDemoJob(origin);
		}
		if (result.processed && 'status' in result && result.status === 'failed') {
			serverError('jobs/demo', 'failed', result);
		}
		return apiSuccess(result);
	} finally {
		releaseDemoLock();
	}
};
