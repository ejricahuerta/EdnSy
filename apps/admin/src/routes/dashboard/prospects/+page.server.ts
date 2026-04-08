import { fail, redirect } from '@sveltejs/kit';
import {
	listProspects,
	getProspectById,
	updateProspectDemoLink,
	updateProspectFromGbp,
	updateProspectStatus,
	deleteProspect,
	setProspectFlagged
} from '$lib/server/prospects';
import {
	getSupabaseAdmin,
	getDemoTrackingMapGlobal,
	getDemoTrackingForProspect,
	getDemoCountThisMonth,
	updateDemoTrackingStatus,
	upsertDemoTrackingForProspect,
	getScrapedDataMapGlobal,
	getScrapedDataForProspectForUser,
	enqueueDemoJob,
	enqueueGbpJob,
	enqueueInsightsJob,
	getDemoJobsMapGlobal,
	getActiveDemoJobForProspect,
	getGbpJobsMapGlobal,
	getInsightsJobsMapGlobal,
	getGbpJobForProspect,
	getInsightsJobForProspect
} from '$lib/server/supabase';
import { resetStaleDemoJobsCreatingToPendingForUser } from '$lib/server/resetStaleDemoJobs';
import { getScrapedDataForDemo, formatScrapedDataErrorMessage } from '$lib/server/gbp';
import { generateDemoHtmlWithClaude } from '$lib/server/claudeGenerateDemoHtml';
import { uploadDemoHtml, uploadDemoHtmlPart } from '$lib/server/demo';
import { DEFAULT_TONE } from '$lib/tones';
import type { ToneSlug } from '$lib/tones';
import type { PageServerLoad, Actions } from './$types';
import { isValidDemoTrackingStatus } from '$lib/demo';
import { getDashboardSessionUser } from '$lib/server/authDashboard';
/** Summary of scraped/GBP data for call log display (serializable). */
export type ScrapedSummary = {
	gbpCompletenessScore?: number | null;
	gbpCompletenessLabel?: string | null;
	googleRatingValue?: number | null;
	googleReviewCount?: number | null;
	gbpClaimed?: boolean | null;
	gbpHasHours?: boolean | null;
};

function buildScrapedSummary(data: Record<string, unknown>): ScrapedSummary {
	return {
		gbpCompletenessScore: (data.gbpCompletenessScore as number | null) ?? null,
		gbpCompletenessLabel: (data.gbpCompletenessLabel as string | null) ?? null,
		googleRatingValue: (data.googleRatingValue as number | null) ?? null,
		googleReviewCount: (data.googleReviewCount as number | null) ?? null,
		gbpClaimed: (data.gbpClaimed as boolean | null) ?? null,
		gbpHasHours: (data.gbpHasHours as boolean | null) ?? null
	};
}
import { serverInfo, serverError } from '$lib/server/logger';
import { getSendConfigured, getOriginForOutgoingLinks, getDemoPublicOrigin } from '$lib/server/send';
import { executeCreateGmailOutreachDraft, executeSendGmailOutreachDraft } from '$lib/server/crmOutreachGmail';
import { PROSPECT_STATUS, isProspectQueuedStatus } from '$lib/prospectStatus';
import { importProspectsFromCsv } from '$lib/server/csvImport';
import {
	runPullGbpDental,
	getGbpDentalDailyStats,
	getGbpDentalPullLock,
	isPlacesConfiguredForGbp
} from '$lib/server/pullGbpDental';

export const load: PageServerLoad = async (event) => {
	const user = await getDashboardSessionUser(event);
	if (!user) {
		throw redirect(303, '/auth/login');
	}
	const demoCountThisMonth = await getDemoCountThisMonth(user.id);
	const result = await listProspects();
	const prospects = result.prospects ?? [];
	const demoTrackingByProspectId = await getDemoTrackingMapGlobal();
	const scrapedDataByProspectId = await getScrapedDataMapGlobal();
	const demoJobsByProspectId = await getDemoJobsMapGlobal();
	const hasDemoCreatingJob = Object.values(demoJobsByProspectId).some((j) => j.status === 'creating');
	const [gbpJobsByProspectId, insightsJobsByProspectId] = await Promise.all([
		getGbpJobsMapGlobal(),
		getInsightsJobsMapGlobal()
	]);
	const sendConfigured = await getSendConfigured(user.id);
	const { todayCount: gbpDentalTodayCount, dailyCap: gbpDentalDailyCap } =
		await getGbpDentalDailyStats(user.id);
	const gbpDentalPullLock = await getGbpDentalPullLock(user.id);
	const placesApiConfigured = isPlacesConfiguredForGbp();
	return {
		prospects,
		prospectsError: 'error' in result ? result.error : undefined,
		prospectsMessage: 'message' in result ? result.message : undefined,
		user,
		demoCountThisMonth,
		demoTrackingByProspectId,
		scrapedDataByProspectId,
		demoJobsByProspectId,
		hasDemoCreatingJob,
		gbpJobsByProspectId,
		insightsJobsByProspectId,
		sendConfigured,
		gbpDentalTodayCount,
		gbpDentalDailyCap,
		gbpDentalPullLock,
		placesApiConfigured
	};
};

export const actions: Actions = {
	pullGbpDental: async (event) => {
		const { cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		const result = await runPullGbpDental(user.id);
		if (!result.ok) return fail(400, { message: result.message });
		return { success: true, message: result.message, added: result.added, leads: result.leads };
	},
	/** Enqueue a demo creation job; processing runs in background via API. */
	enqueueDemo: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) {
			return fail(401, { message: 'Sign in required' });
		}
		const formData = await request.formData();
		const prospectId = formData.get('prospectId');
		if (!prospectId || typeof prospectId !== 'string') {
			return fail(400, { message: 'Missing prospect ID' });
		}
		const prospect = await getProspectById(prospectId);
		if (!prospect) {
			return fail(404, { message: 'Prospect not found' });
		}
		if (prospect.flagged) {
			return fail(400, { message: 'This prospect is out of scope. Demos and GBP are not available.' });
		}
		if (prospect.demoLink) {
			return fail(400, { message: 'Demo already created' });
		}
		const scraped = await getScrapedDataForProspectForUser(user.id, prospectId);
		const hasGbp =
			scraped &&
			typeof scraped === 'object' &&
			scraped.gbpRaw != null &&
			typeof scraped.gbpRaw === 'object';
		if (!hasGbp) {
			return fail(400, {
				message: 'GBP data is required. Run "Pull insights" for this prospect first, then create a demo.'
			});
		}
		const result = await enqueueDemoJob(user.id, prospectId);
		if (!result) {
			return fail(503, { message: 'Could not enqueue job. Is Supabase configured?' });
		}
		await updateProspectStatus(prospectId, PROSPECT_STATUS.DEMO_QUEUED);
		return {
			queued: true,
			jobId: result.jobId,
			prospectId,
			companyName: prospect.companyName ?? undefined,
			alreadyQueued: !result.created
		};
	},
	/**
	 * Process the next step for a single prospect: enqueue Pull data (GBP + website + insight) or Demo.
	 * Pull data = one Insights job that does GBP → website → insight in a single process.
	 */
	processNextStep: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		const formData = await request.formData();
		const prospectId = formData.get('prospectId');
		if (!prospectId || typeof prospectId !== 'string') return fail(400, { message: 'Missing prospect ID' });
		const prospect = await getProspectById(prospectId);
		if (!prospect) return fail(404, { message: 'Prospect not found' });
		if (prospect.flagged) return fail(400, { message: 'This prospect is out of scope.' });

		const [scraped, insightsJob] = await Promise.all([
			getScrapedDataForProspectForUser(user.id, prospectId),
			getInsightsJobForProspect(user.id, prospectId)
		]);
		const scrapedObj = scraped && typeof scraped === 'object' ? scraped : undefined;
		const hasGbp =
			!!scrapedObj?.gbpRaw && typeof scrapedObj.gbpRaw === 'object';
		const hasInsight = scrapedObj?.insight != null;
		const hasIndustry = !!((prospect.industry ?? '').trim());
		const insightsActive = insightsJob?.status === 'pending' || insightsJob?.status === 'running';

		// 1) No insight yet, or have insight but no industry (re-run to infer industry) → enqueue "Pull data" job
		const needsPullData = (!hasInsight || (hasInsight && hasGbp && !hasIndustry)) && !insightsActive;
		if (needsPullData) {
			const result = await enqueueInsightsJob(user.id, prospectId);
			if (!result) return fail(503, { message: 'Could not enqueue. Try again.' });
			await updateProspectStatus(prospectId, PROSPECT_STATUS.GBP_QUEUED);
			return {
				success: true,
				step: 'insights',
				queued: true,
				prospectId,
				companyName: prospect.companyName ?? undefined,
				alreadyQueued: !result.created
			};
		}
		// 2) Have insight (and GBP), no demo → enqueue Demo (or retry after demo failed)
		if (hasGbp && !(prospect.demoLink ?? '').trim()) {
			const result = await enqueueDemoJob(user.id, prospectId);
			if (!result) return fail(503, { message: 'Could not enqueue demo job. Try again.' });
			await updateProspectStatus(prospectId, PROSPECT_STATUS.DEMO_QUEUED);
			return {
				success: true,
				step: 'demo',
				queued: true,
				prospectId,
				companyName: prospect.companyName ?? undefined,
				alreadyQueued: !result.created
			};
		}

		// No actionable step: explain why so the client can show a clear message
		if ((prospect.demoLink ?? '').trim()) {
			return fail(400, { message: 'This prospect already has a demo.' });
		}
		if (hasInsight && !hasGbp) {
			return fail(400, {
				message: 'GBP data is needed. Run Pull data first, then create a demo.'
			});
		}
		return fail(400, { message: 'Nothing to do for this prospect right now.' });
	},
	generateDemo: async (event) => {
		const { request, url, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) {
			return fail(401, { message: 'Sign in required' });
		}
		const formData = await request.formData();
		const prospectId = formData.get('prospectId');
		if (!prospectId || typeof prospectId !== 'string') {
			return fail(400, { message: 'Missing prospect ID' });
		}
		const prospect = await getProspectById(prospectId);
		if (!prospect) {
			return fail(404, { message: 'Prospect not found' });
		}
		if (prospect.flagged) {
			return fail(400, { message: 'This prospect is out of scope. Demos and GBP are not available. You can remove the row if needed.' });
		}
		if (prospect.demoLink) {
			return fail(400, { message: 'Demo already created' });
		}
		// Fetch scraped data (GBP) required for Claude demo generation.
		const scrapedResult = await getScrapedDataForDemo(prospect);
		if (!scrapedResult.ok) {
			return fail(503, { message: formatScrapedDataErrorMessage(scrapedResult.errors) });
		}
		const scrapedData = scrapedResult.data as Record<string, unknown>;
		const gbpRaw = scrapedData.gbpRaw as import('$lib/server/gbp').GbpData | undefined;
		if (!gbpRaw) {
			return fail(400, {
				message: 'GBP data is required. Run "Pull insights" for this prospect first, then create a demo.'
			});
		}
		const effectiveIndustry =
			(gbpRaw?.industry?.trim() && gbpRaw.industry !== 'General' ? gbpRaw.industry : null) ||
			prospect.industry?.trim() ||
			'Professional';
		const tone = (scrapedData.tone as ToneSlug | undefined) ?? DEFAULT_TONE;
		const htmlResult = await generateDemoHtmlWithClaude(prospect, gbpRaw, effectiveIndustry, tone);
		if (!htmlResult.ok) {
			return fail(502, { message: htmlResult.error ?? 'Demo generation failed. Try again.' });
		}
		if (htmlResult.parts) {
			const [p1, p2, p3] = htmlResult.parts;
			const u1 = await uploadDemoHtmlPart(prospectId, 1, p1);
			const u2 = await uploadDemoHtmlPart(prospectId, 2, p2);
			const u3 = await uploadDemoHtmlPart(prospectId, 3, p3);
			if (!u1.ok || !u2.ok || !u3.ok) {
				return fail(502, { message: u1.error ?? u2.error ?? u3.error ?? 'Failed to save demo. Try again.' });
			}
		} else {
			const uploadResult = await uploadDemoHtml(prospectId, htmlResult.html);
			if (!uploadResult.ok) {
				return fail(502, { message: uploadResult.error ?? 'Failed to save demo. Try again.' });
			}
		}
		(scrapedData as Record<string, unknown>).demoSource = 'claude';
		const demoUrl = `${getDemoPublicOrigin(url.origin)}/demo/${prospectId}`;
		const result = await updateProspectDemoLink(prospectId, demoUrl, PROSPECT_STATUS.REVIEW);
		if (!result.ok) {
			return fail(502, { message: result.error ?? 'Failed to update prospect' });
		}
		const supabase = getSupabaseAdmin();
		if (supabase) {
			await upsertDemoTrackingForProspect(
				user.id,
				prospectId,
				prospect.provider ?? 'manual',
				prospect.provider_row_id ?? prospectId,
				demoUrl,
				'draft'
			);
			await updateDemoTrackingStatus(user.id, prospectId, {
				status: 'draft',
				scrapedData
			});
		}
		if (gbpRaw) {
			await updateProspectFromGbp(prospectId, gbpRaw);
		}
		const scrapedSummary = buildScrapedSummary(scrapedData);
		return { success: true, prospectId, demoLink: demoUrl, scrapedSummary };
	},
	updateDemoStatus: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) {
			return fail(401, { message: 'Sign in required' });
		}
		const formData = await request.formData();
		const prospectId = formData.get('prospectId');
		const status = formData.get('status');
		if (!prospectId || typeof prospectId !== 'string') {
			return fail(400, { message: 'Missing prospect ID' });
		}
		if (!status || typeof status !== 'string' || !isValidDemoTrackingStatus(status)) {
			return fail(400, { message: 'Invalid status' });
		}
		const result = await updateDemoTrackingStatus(user.id, prospectId, { status });
		if (!result.ok) {
			return fail(502, { message: result.error ?? 'Failed to update demo status' });
		}
		return { success: true, prospectId, status };
	},
	/** Regenerate demo: enqueue a job so Claude runs one-at-a-time (avoids rate limit when multiple demos created). */
	regenerateDemo: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) {
			return fail(401, { message: 'Sign in required' });
		}
		const formData = await request.formData();
		const prospectId = formData.get('prospectId');
		if (!prospectId || typeof prospectId !== 'string') {
			return fail(400, { message: 'Missing prospect ID' });
		}
		const prospect = await getProspectById(prospectId);
		if (!prospect) {
			return fail(404, { message: 'Prospect not found' });
		}
		if (prospect.flagged) {
			return fail(400, { message: 'This prospect is out of scope.' });
		}
		if (!prospect.demoLink) {
			return fail(400, { message: 'No demo to regenerate. Create a demo first.' });
		}
		const result = await enqueueDemoJob(user.id, prospectId);
		if (!result) {
			return fail(503, { message: 'Could not queue regeneration. Try again.' });
		}
		// Regenerating always resets tracking to draft (was approved or draft); callback also sets draft on completion.
		await updateDemoTrackingStatus(user.id, prospectId, { status: 'draft' });
		return { success: true, prospectId, queued: true, jobId: result.jobId, alreadyQueued: !result.created };
	},
	bulkApproveDemos: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) {
			return fail(401, { message: 'Sign in required' });
		}
		const formData = await request.formData();
		const prospectIds = formData.getAll('prospectId');
		if (prospectIds.length === 0) {
			return fail(400, { message: 'Select at least one prospect' });
		}
		const supabase = getSupabaseAdmin();
		if (!supabase) {
			return fail(503, { message: 'Demo tracking not configured' });
		}
		for (const id of prospectIds) {
			if (typeof id !== 'string') continue;
			await updateDemoTrackingStatus(user.id, id, {
				status: 'approved'
			});
		}
		return { success: true, total: prospectIds.length };
	},
	bulkGenerateDemos: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) {
			return fail(401, { message: 'Sign in required' });
		}
		const formData = await request.formData();
		const prospectIds = formData.getAll('prospectId') as string[];
		if (prospectIds.length === 0) {
			return fail(400, { message: 'Select at least one prospect' });
		}
		const scrapedMap = await getScrapedDataMapGlobal();
		let queued = 0;
		const errors: string[] = [];
		for (const prospectId of prospectIds) {
			const prospect = await getProspectById(prospectId);
			if (!prospect) continue;
			if (prospect.flagged) continue;
			if (prospect.demoLink) continue;
			const scraped = scrapedMap[prospectId];
			const hasGbp =
				scraped &&
				typeof scraped === 'object' &&
				scraped.gbpRaw != null &&
				typeof scraped.gbpRaw === 'object';
			if (!hasGbp) continue; // Skip prospects without GBP; do not enqueue
			const result = await enqueueDemoJob(user.id, prospectId);
			if (!result) {
				errors.push(`${prospect.companyName || prospectId}: Could not enqueue`);
				continue;
			}
			if (result.created) queued++;
			await updateProspectStatus(prospectId, PROSPECT_STATUS.DEMO_QUEUED);
		}
		if (queued === 0 && errors.length > 0) {
			return fail(502, { message: errors.slice(0, 3).join('; ') });
		}
		return {
			success: true,
			queued,
			total: prospectIds.length,
			errors: errors.length > 0 ? errors.slice(0, 5) : undefined
		};
	},
	sendDemos: async (event) => {
		const { request, url, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) {
			return fail(401, { message: 'Sign in required' });
		}
		if (!(await getSendConfigured(user.id))) {
			return fail(503, {
				message: 'Gmail is not configured. Connect Gmail in Integrations (draft access required).'
			});
		}
		const formData = await request.formData();
		if (formData.get('aupConfirmed') !== 'on') {
			return fail(400, {
				message: 'You must confirm compliance with the Acceptable Use Policy before creating drafts.'
			});
		}
		const prospectIds = formData.getAll('prospectId');
		if (prospectIds.length === 0) {
			return fail(400, { message: 'Select at least one prospect.' });
		}
		serverInfo('sendDemos', 'Started (Gmail drafts)', { prospectCount: prospectIds.length });
		const linkOrigin = getOriginForOutgoingLinks(url.origin);
		let sent = 0;
		const errors: string[] = [];
		for (const id of prospectIds) {
			if (typeof id !== 'string') continue;
			const prospect = await getProspectById(id);
			if (!prospect?.demoLink || prospect.flagged) continue;
			let demoTracking = await getDemoTrackingForProspect(user.id, id);
			if (!demoTracking && (prospect.demoLink ?? '').trim()) {
				await upsertDemoTrackingForProspect(
					user.id,
					id,
					prospect.provider ?? 'manual',
					prospect.provider_row_id ?? id,
					(prospect.demoLink ?? '').trim(),
					'approved'
				);
				demoTracking = await getDemoTrackingForProspect(user.id, id);
			}
			if (
				!demoTracking ||
				(demoTracking.status !== 'approved' && demoTracking.status !== 'email_draft')
			) {
				continue;
			}
			if (prospect.email?.trim()) {
				const ex = await executeCreateGmailOutreachDraft({
					userId: user.id,
					appUserEmail: user.email,
					prospect,
					prospectId: id,
					kind: 'demo',
					linkOrigin,
					setDemoTrackingEmailDraft: true
				});
				if (ex.ok) {
					sent++;
					serverInfo('sendDemos', 'Gmail draft created', { to: prospect.email.trim(), prospectId: id });
				} else {
					errors.push(`${prospect.companyName || id}: ${ex.error}`);
					serverError('sendDemos', ex.error, { prospectId: id, to: prospect.email.trim() });
				}
			} else {
				errors.push(`${prospect.companyName || id}: No email (add one on the prospect page to create a Gmail draft)`);
			}
		}
		if (sent === 0 && errors.length > 0) {
			serverError('sendDemos', 'No drafts created', { sent, errors });
			return fail(502, { message: errors.slice(0, 3).join('; ') });
		}
		if (sent === 0) {
			return fail(400, {
				message:
					'No Gmail draft was created. Each prospect needs a demo link, approved (or draft) status, and usually an email. Add an email on the prospect detail page if missing.'
			});
		}
		serverInfo('sendDemos', 'Completed', { sent, total: prospectIds.length, errors: errors.length > 0 ? errors : undefined });
		return {
			success: true,
			sent,
			total: prospectIds.length,
			errors: errors.length > 0 ? errors.slice(0, 5) : undefined
		};
	},
	/** Send every stored Gmail outreach draft (drafts.send) for prospects that have gmail_outreach_draft_id. */
	sendGmailOutreachDraftsBulk: async (event) => {
		const { request } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		if (!(await getSendConfigured(user.id))) {
			return fail(503, { message: 'Gmail is not connected. Connect Gmail in Integrations.' });
		}
		const formData = await request.formData();
		if (formData.get('aupConfirmed') !== 'on') {
			return fail(400, {
				message: 'You must confirm compliance with the Acceptable Use Policy before sending.'
			});
		}
		const listResult = await listProspects();
		const rows = 'prospects' in listResult ? listResult.prospects : [];
		const withDraft = rows.filter(
			(p) => (p.gmailOutreachDraftId ?? '').trim().length > 0 && !p.flagged
		);
		if (withDraft.length === 0) {
			return fail(400, { message: 'No Gmail drafts on file. Create drafts from prospect rows or the detail page first.' });
		}
		serverInfo('sendGmailOutreachDraftsBulk', 'Started', { count: withDraft.length });
		let sent = 0;
		const errors: string[] = [];
		for (const row of withDraft) {
			const prospect = await getProspectById(row.id);
			if (!prospect || !(prospect.gmailOutreachDraftId ?? '').trim()) continue;
			const ex = await executeSendGmailOutreachDraft({
				userId: user.id,
				prospect,
				prospectId: row.id
			});
			if (ex.ok) {
				sent++;
				serverInfo('sendGmailOutreachDraftsBulk', 'Sent', { prospectId: row.id });
			} else {
				errors.push(`${prospect.companyName || row.id}: ${ex.error}`);
				serverError('sendGmailOutreachDraftsBulk', ex.error, { prospectId: row.id });
			}
		}
		if (sent === 0 && errors.length > 0) {
			return fail(502, { message: errors.slice(0, 3).join('; ') });
		}
		if (sent === 0) {
			return fail(400, { message: 'No draft could be sent. Check Gmail and recreate drafts if needed.' });
		}
		serverInfo('sendGmailOutreachDraftsBulk', 'Completed', { sent, total: withDraft.length, errors: errors.length });
		return {
			success: true,
			sent,
			total: withDraft.length,
			errors: errors.length > 0 ? errors.slice(0, 5) : undefined
		};
	},
	deleteProspect: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		const formData = await request.formData();
		const prospectId = formData.get('prospectId');
		if (!prospectId || typeof prospectId !== 'string') return fail(400, { message: 'Missing prospect ID' });
		const result = await deleteProspect(prospectId);
		if (!result.ok)
			return fail(
				result.error === 'Prospect not found' || result.error === 'Prospect not found or access denied'
					? 404
					: 502,
				{ message: result.error ?? 'Failed to delete' }
			);
		return { success: true, prospectId };
	},
	/** Bulk enqueue GBP jobs for selected prospects (GBP queue tab). Inserts into gbp_jobs (status pending); cron processes them. */
	bulkEnqueueGbp: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		const formData = await request.formData();
		const prospectIds = formData.getAll('prospectId') as string[];
		if (prospectIds.length === 0) return fail(400, { message: 'Select at least one prospect' });
		let queued = 0;
		let skipped = 0; // prospect missing/flagged
		let enqueueFailed = 0; // enqueueGbpJob returned null (e.g. Supabase not configured)
		for (const prospectId of prospectIds) {
			const prospect = await getProspectById(prospectId);
			if (!prospect || prospect.flagged) {
				skipped++;
				continue;
			}
			const result = await enqueueGbpJob(user.id, prospectId);
			if (result) {
				if (result.created) queued++;
				await updateProspectStatus(prospectId, PROSPECT_STATUS.GBP_QUEUED);
			} else {
				enqueueFailed++;
			}
		}
		return { success: true, queued, total: prospectIds.length, skipped, enqueueFailed };
	},
	/** Bulk enqueue Insights jobs for selected prospects (Insights queue tab). */
	bulkEnqueueInsights: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		const formData = await request.formData();
		const prospectIds = formData.getAll('prospectId') as string[];
		if (prospectIds.length === 0) return fail(400, { message: 'Select at least one prospect' });
		let queued = 0;
		for (const prospectId of prospectIds) {
			const prospect = await getProspectById(prospectId);
			if (!prospect || prospect.flagged) continue;
			const result = await enqueueInsightsJob(user.id, prospectId);
			if (result) {
				if (result.created) queued++;
				await updateProspectStatus(prospectId, PROSPECT_STATUS.GBP_QUEUED);
			}
		}
		return { success: true, queued, total: prospectIds.length };
	},
	/** Soft delete: set flagged = true (moves to Deleted/not fit). */
	setFlagged: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		const formData = await request.formData();
		const prospectId = formData.get('prospectId');
		if (!prospectId || typeof prospectId !== 'string') return fail(400, { message: 'Missing prospect ID' });
		const result = await setProspectFlagged(prospectId, true);
		if (!result.ok) return fail(502, { message: result.error ?? 'Failed to update' });
		return { success: true, prospectId };
	},
	/** Restore: set flagged = false (removes from Deleted/not fit). */
	restoreProspect: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		const formData = await request.formData();
		const prospectId = formData.get('prospectId');
		if (!prospectId || typeof prospectId !== 'string') return fail(400, { message: 'Missing prospect ID' });
		const result = await setProspectFlagged(prospectId, false);
		if (!result.ok) return fail(502, { message: result.error ?? 'Failed to restore' });
		return { success: true, prospectId };
	},
	/** Bulk restore: set flagged = false for selected prospects (Deleted tab). */
	bulkRestore: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		const formData = await request.formData();
		const prospectIds = formData.getAll('prospectId') as string[];
		if (prospectIds.length === 0) return fail(400, { message: 'Select at least one prospect' });
		let restored = 0;
		for (const prospectId of prospectIds) {
			const result = await setProspectFlagged(prospectId, false);
			if (result.ok) restored++;
		}
		return { success: true, restored, total: prospectIds.length };
	},
	/**
	 * Process the next step for each selected prospect: queue GBP for pull_data,
	 * queue demos for create_demo/retry_demo, restore for flagged.
	 * Client sends JSON arrays via form fields pullDataIds, demoIds, flaggedIds.
	 */
	bulkProcessNextStep: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		const formData = await request.formData();
		const parseIds = (raw: FormDataEntryValue | null): string[] => {
			if (!raw || typeof raw !== 'string') return [];
			try {
				const a = JSON.parse(raw) as unknown;
				return Array.isArray(a) ? a.filter((id): id is string => typeof id === 'string') : [];
			} catch {
				return [];
			}
		};
		const pullDataIds = parseIds(formData.get('pullDataIds'));
		const demoIds = parseIds(formData.get('demoIds'));
		const flaggedIds = parseIds(formData.get('flaggedIds'));
		const hasAny = pullDataIds.length > 0 || demoIds.length > 0 || flaggedIds.length > 0;
		if (!hasAny) return fail(400, { message: 'No actionable prospects selected' });

		// Pull data queue (one process: GBP + website + insight via Insights job)
		let pullDataQueued = 0;
		let pullDataEnqueueFailed = 0;
		for (const prospectId of pullDataIds) {
			const prospect = await getProspectById(prospectId);
			if (!prospect || prospect.flagged) continue;
			const result = await enqueueInsightsJob(user.id, prospectId);
			if (result) {
				if (result.created) pullDataQueued++;
				await updateProspectStatus(prospectId, PROSPECT_STATUS.GBP_QUEUED);
			} else {
				pullDataEnqueueFailed++;
			}
		}

		// Demo queue (create + retry); only enqueue prospects that have GBP data
		const scrapedMap = await getScrapedDataMapGlobal();
		let demoQueued = 0;
		const demoErrors: string[] = [];
		for (const prospectId of demoIds) {
			const prospect = await getProspectById(prospectId);
			if (!prospect || prospect.flagged || prospect.demoLink) continue;
			const scraped = scrapedMap[prospectId];
			const hasGbp =
				scraped &&
				typeof scraped === 'object' &&
				scraped.gbpRaw != null &&
				typeof scraped.gbpRaw === 'object';
			if (!hasGbp) continue; // Skip prospects without GBP; do not enqueue
			const result = await enqueueDemoJob(user.id, prospectId);
			if (!result) {
				demoErrors.push(`${prospect.companyName || prospectId}: Could not enqueue`);
				continue;
			}
			if (result.created) demoQueued++;
			await updateProspectStatus(prospectId, PROSPECT_STATUS.DEMO_QUEUED);
		}

		// Restore (unflag)
		let restored = 0;
		for (const prospectId of flaggedIds) {
			const result = await setProspectFlagged(prospectId, false);
			if (result.ok) restored++;
		}

		return {
			success: true,
			gbp: { queued: pullDataQueued, total: pullDataIds.length, enqueueFailed: pullDataEnqueueFailed },
			demos: { queued: demoQueued, total: demoIds.length, errors: demoErrors.slice(0, 5) },
			restored: { count: restored, total: flaggedIds.length }
		};
	},
	/**
	 * Clear queued status for prospects that have no active job (demo, GBP, or insights).
	 * Use when prospects appear stuck (e.g. cron not running or jobs already finished).
	 */
	clearStuckQueueStatus: async (event) => {
		const { cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		const result = await listProspects();
		const prospects = result.prospects ?? [];
		const [demoJobsByProspectId, gbpJobsByProspectId, insightsJobsByProspectId] = await Promise.all([
			getDemoJobsMapGlobal(),
			getGbpJobsMapGlobal(),
			getInsightsJobsMapGlobal()
		]);
		let cleared = 0;
		for (const p of prospects) {
			if (!isProspectQueuedStatus(p.status)) continue;
			const dj = demoJobsByProspectId[p.id];
			const hasDemoJob = dj && (dj.status === 'pending' || dj.status === 'creating');
			const hasGbpJob = Boolean(gbpJobsByProspectId[p.id]);
			const hasInsightsJob = Boolean(insightsJobsByProspectId[p.id]);
			if (!hasDemoJob && !hasGbpJob && !hasInsightsJob) {
				await updateProspectStatus(p.id, PROSPECT_STATUS.NEW);
				cleared++;
			}
		}
		return { success: true, cleared };
	},
	/**
	 * Reset paid demo_jobs stuck in `creating` (over the staleness window) to `pending` for this user.
	 * Same logic as cron; use when a demo is stuck in generating without waiting for the next cron tick.
	 */
	resetStuckDemoJobs: async (event) => {
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		const resetCount = await resetStaleDemoJobsCreatingToPendingForUser(user.id);
		return { success: true, resetCount };
	},
	/** Upload CSV: header row with company + email columns; optional website, phone, industry. Insert-only (skips existing). */
	importCsv: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		const formData = await request.formData();
		const file = formData.get('csvFile');
		if (!file || !(file instanceof File)) {
			return fail(400, { message: 'Choose a CSV file.' });
		}
		if (file.size > 2 * 1024 * 1024) {
			return fail(400, { message: 'File too large (max 2 MB).' });
		}
		let text: string;
		try {
			text = await file.text();
		} catch {
			return fail(400, { message: 'Could not read file.' });
		}
		const result = await importProspectsFromCsv(user.id, text);
		if (result.errors.length > 0 && result.inserted === 0 && result.skipped === 0 && result.failed === 0) {
			return fail(400, { message: result.errors[0] ?? 'Import failed.' });
		}
		return {
			success: true,
			inserted: result.inserted,
			skipped: result.skipped,
			failed: result.failed,
			errors: result.errors.length > 0 ? result.errors : undefined
		};
	}
};
