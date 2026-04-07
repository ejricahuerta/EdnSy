import type { RequestHandler } from './$types';
import { processOneDemoJob } from '$lib/server/demo';
import { getOriginForOutgoingLinks } from '$lib/server/send';
import { env } from '$env/dynamic/private';
import { apiError, apiSuccess } from '$lib/server/apiResponse';
import { serverInfo, serverError } from '$lib/server/logger';
import { tryAcquireDemoLock, releaseDemoLock } from '$lib/server/demoJobLock';
import { isDemoCurrentlyInProgress } from '$lib/server/supabase';
import { resetStaleDemoJobsCreatingToPending } from '$lib/server/resetStaleDemoJobs';

/**
 * GET /api/cron/jobs/demo — Cron: process one pending demo job.
 * Secured by CRON_SECRET (Vercel sends Authorization: Bearer CRON_SECRET).
 * Only one demo runs at a time (in-memory lock + DB check) to avoid Claude rate limits.
 * Resets stale `creating` rows, then skips if a demo is already in progress (handles restarts/disconnects).
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

	if (!tryAcquireDemoLock()) {
		serverInfo('cron/jobs/demo', 'skipped (another demo already running)');
		return apiSuccess({ processed: false });
	}
	try {
		await resetStaleDemoJobsCreatingToPending();
		if (await isDemoCurrentlyInProgress()) {
			releaseDemoLock();
			serverInfo('cron/jobs/demo', 'skipped (demo already in progress, e.g. after restart)');
			return apiSuccess({ processed: false });
		}
		const result = await processOneDemoJob(origin);

		if (result.processed) {
			const id = 'jobId' in result ? result.jobId : undefined;
			const status = 'status' in result ? result.status : '?';
			const extra = 'companyName' in result && result.companyName ? result.companyName : 'demoLink' in result ? result.demoLink : '';
			serverInfo('cron/jobs/demo', `processed id=${id} status=${status}${extra ? ` ${extra}` : ''}`);
			if ('status' in result && result.status === 'failed') {
				serverError('cron/jobs/demo', 'failed', result);
			}
		} else {
			serverInfo('cron/jobs/demo', 'no job processed (queue empty)');
		}
		return apiSuccess(result);
	} finally {
		releaseDemoLock();
	}
};
