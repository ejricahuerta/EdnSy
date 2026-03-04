import type { RequestHandler } from './$types';
import { processOneDemoJob } from '$lib/server/demo';
import { processOneFreeDemoJob } from '$lib/server/processFreeDemoJob';
import { getOriginForOutgoingLinks } from '$lib/server/send';
import { env } from '$env/dynamic/private';
import { apiError, apiSuccess } from '$lib/server/apiResponse';
import { serverInfo, serverError } from '$lib/server/logger';

/**
 * GET /api/cron/jobs/demo — Cron: process one pending demo job (paid first, then free).
 * Secured by CRON_SECRET (Vercel sends Authorization: Bearer CRON_SECRET).
 */
export const GET: RequestHandler = async ({ request }) => {
	const authHeader = request.headers.get('authorization');
	const secret = (env.CRON_SECRET ?? '').trim();
	if (!secret || authHeader !== `Bearer ${secret}`) {
		return apiError(401, 'Unauthorized');
	}

	const requestOrigin = request.url ? new URL(request.url).origin : '';
	const origin = getOriginForOutgoingLinks(requestOrigin) || requestOrigin;
	if (!origin) {
		return apiError(500, 'SITE_ORIGIN not set');
	}

	let result = await processOneDemoJob(origin);
	if (!result.processed) {
		result = await processOneFreeDemoJob(origin);
	}

	if (result.processed) {
		const id = 'jobId' in result ? result.jobId : 'requestId' in result ? result.requestId : undefined;
		const kind = 'jobId' in result ? 'paid' : 'free';
		const status = 'status' in result ? result.status : '?';
		const extra = 'companyName' in result && result.companyName ? result.companyName : 'demoLink' in result ? result.demoLink : '';
		serverInfo('cron/jobs/demo', `processed ${kind} id=${id} status=${status}${extra ? ` ${extra}` : ''}`);
		if ('status' in result && result.status === 'failed') {
			serverError('cron/jobs/demo', 'failed', result);
		}
	} else {
		serverInfo('cron/jobs/demo', 'no job processed (queue empty)');
	}
	return apiSuccess(result);
};
