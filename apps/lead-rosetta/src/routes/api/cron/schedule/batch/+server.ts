import type { RequestHandler } from './$types';
import { PROSPECT_STATUS } from '$lib/prospectStatus';
import {
	listProspectIdsForStatusBatch,
	updateProspectStatus,
	getProspectById
} from '$lib/server/prospects';
import { enqueueInsightsJob, enqueueDemoJob, getScrapedDataMapForUser } from '$lib/server/supabase';
import { env } from '$env/dynamic/private';
import { apiError, apiSuccess } from '$lib/server/apiResponse';

const BATCH_SIZE = 10;

/**
 * GET /api/cron/schedule/batch — Enqueue up to 10× `new` → insights + `gbp queued`,
 * and up to 10× `demo pending` → demo job + `demo queued`. Secured by CRON_SECRET.
 */
export const GET: RequestHandler = async ({ request }) => {
	const authHeader = request.headers.get('authorization');
	const secret = (env.CRON_SECRET ?? '').trim();
	if (!secret || authHeader !== `Bearer ${secret}`) {
		return apiError(401, 'Unauthorized');
	}

	const newRows = await listProspectIdsForStatusBatch(PROSPECT_STATUS.NEW, BATCH_SIZE);
	let pullEnqueued = 0;
	let pullSkipped = 0;
	for (const row of newRows) {
		const prospect = await getProspectById(row.id);
		if (!prospect || prospect.flagged) {
			pullSkipped++;
			continue;
		}
		const result = await enqueueInsightsJob(row.user_id, row.id);
		if (result) {
			await updateProspectStatus(row.id, PROSPECT_STATUS.GBP_QUEUED);
			if (result.created) pullEnqueued++;
		} else {
			pullSkipped++;
		}
	}

	const demoRows = await listProspectIdsForStatusBatch(PROSPECT_STATUS.DEMO_PENDING, BATCH_SIZE);
	const userIds = [...new Set(demoRows.map((r) => r.user_id))];
	const scrapedByUser = new Map<string, Record<string, unknown>>();
	for (const uid of userIds) {
		scrapedByUser.set(uid, await getScrapedDataMapForUser(uid));
	}

	let demoEnqueued = 0;
	let demoSkipped = 0;
	for (const row of demoRows) {
		const prospect = await getProspectById(row.id);
		if (!prospect || prospect.flagged || prospect.demoLink) {
			demoSkipped++;
			continue;
		}
		const scrapedMap = scrapedByUser.get(row.user_id) ?? {};
		const scraped = scrapedMap[row.id];
		const hasGbp =
			scraped &&
			typeof scraped === 'object' &&
			(scraped as { gbpRaw?: unknown }).gbpRaw != null &&
			typeof (scraped as { gbpRaw?: unknown }).gbpRaw === 'object';
		if (!hasGbp) {
			demoSkipped++;
			continue;
		}
		const result = await enqueueDemoJob(row.user_id, row.id);
		if (result) {
			await updateProspectStatus(row.id, PROSPECT_STATUS.DEMO_QUEUED);
			if (result.created) demoEnqueued++;
		} else {
			demoSkipped++;
		}
	}

	return apiSuccess({
		pull: { candidates: newRows.length, jobsCreated: pullEnqueued, skipped: pullSkipped },
		demos: { candidates: demoRows.length, jobsCreated: demoEnqueued, skipped: demoSkipped }
	});
};
