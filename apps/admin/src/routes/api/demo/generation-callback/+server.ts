/**
 * POST /api/demo/generation-callback — Called by the website-template demo generator when async demo generation finishes.
 * Secured by DEMO_CALLBACK_SECRET (Authorization: Bearer <secret>).
 * Body: { jobId, prospectId, userId?, publicUrl?, html? } on success, or { jobId, prospectId, userId?, error } on failure.
 * When `html` is present, admin app uploads it to Supabase (demo-html/{prospectId}.html) so the demo page loads.
 */

import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { getProspectById } from '$lib/server/prospects';
import {
	getSupabaseAdmin,
	updateDemoJob,
	updateDemoTrackingStatus,
	upsertDemoTrackingForProspect
} from '$lib/server/supabase';
import { updateProspectDemoLink, updateProspectStatus } from '$lib/server/prospects';
import { PROSPECT_STATUS } from '$lib/prospectStatus';
import { uploadDemoHtml } from '$lib/server/demo';
import { apiError, apiSuccess } from '$lib/server/apiResponse';
import { getDemoPublicOrigin } from '$lib/server/send';

const CALLBACK_SECRET = (env.DEMO_CALLBACK_SECRET ?? '').trim();

export const POST: RequestHandler = async ({ request, url }) => {
	const authHeader = request.headers.get('authorization');
	const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
	const altToken = request.headers.get('x-callback-token')?.trim() ?? '';
	const effectiveToken = token || altToken;

	if (!CALLBACK_SECRET || effectiveToken !== CALLBACK_SECRET) {
		return apiError(401, 'Unauthorized');
	}

	let body: {
		jobId?: string;
		prospectId?: string;
		userId?: string;
		publicUrl?: string;
		html?: string;
		error?: string;
	};
	try {
		body = (await request.json()) as typeof body;
	} catch {
		return apiError(400, 'Invalid JSON');
	}

	const { jobId, prospectId, userId, publicUrl, html: callbackHtml, error: errorMessage } = body;
	if (!jobId || !prospectId) {
		return apiError(400, 'jobId and prospectId are required');
	}

	const prospect = await getProspectById(prospectId);
	if (!prospect) {
		return apiError(404, 'Prospect not found');
	}

	if (errorMessage != null && errorMessage !== '') {
		await updateDemoJob(jobId, { status: 'failed', errorMessage });
		await updateProspectStatus(prospectId, PROSPECT_STATUS.NEW);
		return apiSuccess({ ok: true });
	}

	const demoBase = getDemoPublicOrigin((env.SITE_ORIGIN ?? '').trim() || (url.origin ?? ''));
	const demoLink = `${demoBase}/demo/${prospectId}`;

	// When the generator sends HTML in the callback, upload it so /demo/[slug]/page.html can serve it.
	if (typeof callbackHtml === 'string' && callbackHtml.trim().length > 0) {
		const uploadResult = await uploadDemoHtml(prospectId, callbackHtml.trim());
		if (!uploadResult.ok) {
			await updateDemoJob(jobId, { status: 'failed', errorMessage: uploadResult.error ?? 'Failed to store demo HTML' });
			await updateProspectStatus(prospectId, PROSPECT_STATUS.NEW);
			return apiError(500, uploadResult.error ?? 'Failed to store demo HTML');
		}
	}

	const updateResult = await updateProspectDemoLink(prospectId, demoLink, PROSPECT_STATUS.REVIEW);
	if (!updateResult.ok) {
		await updateDemoJob(jobId, { status: 'failed', errorMessage: updateResult.error ?? 'Failed to update prospect' });
		await updateProspectStatus(prospectId, PROSPECT_STATUS.NEW);
		return apiError(500, updateResult.error ?? 'Failed to update prospect');
	}

	if (userId) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			await upsertDemoTrackingForProspect(
				userId,
				prospectId,
				prospect.provider ?? 'manual',
				prospect.provider_row_id ?? prospectId,
				demoLink,
				'draft'
			);
			await updateDemoTrackingStatus(userId, prospectId, { status: 'draft' });
		}
	}

	await updateDemoJob(jobId, { status: 'done', demoLink });
	return apiSuccess({ ok: true });
};
