import type { RequestHandler } from './$types';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';
import { processOneDemoJob } from '$lib/server/demo';
import { processOneFreeDemoJob } from '$lib/server/processFreeDemoJob';
import { getOriginForOutgoingLinks } from '$lib/server/send';
import { apiError, apiSuccess } from '$lib/server/apiResponse';

/**
 * Process one pending demo job from the queue (paid first, then free try demos).
 * POST /api/jobs/demo — run one demo job. Requires session (dashboard user).
 */
export const POST: RequestHandler = async ({ cookies, url }) => {
	const cookie = cookies.get(getSessionCookieName());
	const user = await getSessionFromCookie(cookie);
	if (!user) {
		return apiError(401, 'Sign in required');
	}

	const origin = getOriginForOutgoingLinks(url.origin);
	let result = await processOneDemoJob(origin);
	if (!result.processed) {
		result = await processOneFreeDemoJob(origin);
	}
	if (result.processed && 'status' in result && result.status === 'failed') {
		console.error('[jobs/demo] failed', result);
	}
	return apiSuccess(result);
};
