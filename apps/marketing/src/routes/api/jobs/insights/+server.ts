import type { RequestHandler } from './$types';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';
import { processOneInsightsJob } from '$lib/server/demo';
import { getInsightsJobForProspect } from '$lib/server/supabase';
import { getProspectByIdForUser } from '$lib/server/prospects';
import { apiError, apiSuccess } from '$lib/server/apiResponse';

/**
 * Process one pending "Pull insights" job from the queue.
 * POST /api/jobs/insights — run one insights job. If body.prospectId is sent, response includes currentJob when done/failed.
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
	const cookie = cookies.get(getSessionCookieName());
	const user = await getSessionFromCookie(cookie);
	if (!user) {
		return apiError(401, 'Sign in required');
	}

	let prospectIdFromBody: string | undefined;
	try {
		const body = await request.json().catch(() => ({}));
		prospectIdFromBody = typeof body?.prospectId === 'string' ? body.prospectId : undefined;
	} catch {
		// ignore
	}

	const result = await processOneInsightsJob();
	if (result.processed && result.status === 'failed') {
		console.error('[jobs/insights] failed', result);
	}

	const out: Record<string, unknown> = { ...result };

	if (prospectIdFromBody) {
		const job = await getInsightsJobForProspect(user.id, prospectIdFromBody);
		if (job && (job.status === 'done' || job.status === 'failed')) {
			const prospect = await getProspectByIdForUser(user.id, prospectIdFromBody);
			out.currentJob = {
				prospectId: prospectIdFromBody,
				status: job.status,
				errorMessage: job.errorMessage ?? undefined,
				companyName: prospect?.companyName ?? undefined
			};
		}
	}

	return apiSuccess(out);
};
