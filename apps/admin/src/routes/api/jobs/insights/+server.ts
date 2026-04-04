import type { RequestHandler } from './$types';
import { getDashboardSessionUser } from '$lib/server/authDashboard';
import { processOneInsightsJob } from '$lib/server/demo';
import { getInsightsJobForProspectLatest } from '$lib/server/supabase';
import { getProspectById } from '$lib/server/prospects';
import { apiError, apiSuccess } from '$lib/server/apiResponse';
import { serverError } from '$lib/server/logger';

/**
 * Process one pending "Pull insights" job from the queue.
 * POST /api/jobs/insights — run one insights job. If body.prospectId is sent, response includes currentJob when done/failed.
 */
export const POST: RequestHandler = async (event) => {
	const { request, cookies } = event;
	const user = await getDashboardSessionUser(event);
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
		serverError('jobs/insights', 'failed', result);
	}

	const out: Record<string, unknown> = { ...result };

	if (prospectIdFromBody) {
		const job = await getInsightsJobForProspectLatest(prospectIdFromBody);
		if (job && (job.status === 'done' || job.status === 'failed')) {
			const prospect = await getProspectById(prospectIdFromBody);
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
