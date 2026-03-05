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
	getDemoTrackingForUser,
	getDemoTrackingForProspect,
	getDemoCountThisMonth,
	updateDemoTrackingStatus,
	upsertDemoTrackingForProspect,
	getScrapedDataMapForUser,
	getScrapedDataForProspectForUser,
	enqueueDemoJob,
	enqueueGbpJob,
	enqueueInsightsJob,
	getDemoJobsForUser,
	getActiveDemoJobForProspect,
	getGbpJobsForUser,
	getInsightsJobsForUser
} from '$lib/server/supabase';
import { getScrapedDataForDemo, formatScrapedDataErrorMessage } from '$lib/server/gbp';
import { generateDemoWithV0 } from '$lib/server/v0GenerateDemo';
import { DEFAULT_TONE } from '$lib/tones';
import type { ToneSlug } from '$lib/tones';
import type { PageServerLoad, Actions } from './$types';
import { isValidDemoTrackingStatus } from '$lib/demo';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';
import { getCrmIndustryFilter, getEffectiveEmailSenderName, getEmailSignatureOverride } from '$lib/server/userSettings';
import { industryDisplayToSlug } from '$lib/industries';

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
import { getPlanForUser } from '$lib/server/stripe';
import { getDemoCreationLimit, canSendAutomated } from '$lib/plans';
import { serverInfo, serverError } from '$lib/server/logger';
import {
	sendEmail,
	sendSms,
	getDefaultEmailSubject,
	buildEmailBodyForUser,
	buildEmailBodyFromAiIntro,
	buildSmsBody,
	getSendConfigured,
	getOriginForOutgoingLinks,
	isTwilioConfigured
} from '$lib/server/send';
import { generateEmailCopy } from '$lib/server/generateEmailCopy';
import { getTemplates } from '$lib/server/templates';

export const load: PageServerLoad = async ({ cookies }) => {
	const cookie = cookies.get(getSessionCookieName());
	const user = await getSessionFromCookie(cookie);
	if (!user) {
		throw redirect(303, '/auth/login');
	}
	const plan = await getPlanForUser(user);
	const demoLimit = getDemoCreationLimit(plan);
	const demoCountThisMonth = await getDemoCountThisMonth(user.id);
	const result = await listProspects(user.id);
	const crmIndustryFilter = await getCrmIndustryFilter(user.id);
	let prospects = result.prospects;
	if (crmIndustryFilter.length > 0) {
		const allowed = new Set(crmIndustryFilter);
		prospects = prospects.filter((p) => allowed.has(industryDisplayToSlug(p.industry)));
	}
	const demoTrackingByProspectId = await getDemoTrackingForUser(user.id);
	const scrapedDataByProspectId = await getScrapedDataMapForUser(user.id);
	const demoJobsByProspectId = await getDemoJobsForUser(user.id);
	const [gbpJobsByProspectId, insightsJobsByProspectId] = await Promise.all([
		getGbpJobsForUser(user.id),
		getInsightsJobsForUser(user.id)
	]);
	const sendConfigured = await getSendConfigured(user.id);
	return {
		prospects,
		prospectsError: 'error' in result ? result.error : undefined,
		prospectsMessage: 'message' in result ? result.message : undefined,
		user,
		plan,
		demoLimit,
		demoCountThisMonth,
		demoTrackingByProspectId,
		scrapedDataByProspectId,
		demoJobsByProspectId,
		gbpJobsByProspectId,
		insightsJobsByProspectId,
		sendConfigured
	};
};

export const actions: Actions = {
	/** Enqueue a demo creation job; processing runs in background via API. */
	enqueueDemo: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) {
			return fail(401, { message: 'Sign in required' });
		}
		const plan = await getPlanForUser(user);
		const demoLimit = getDemoCreationLimit(plan);
		if (demoLimit !== null) {
			const count = await getDemoCountThisMonth(user.id);
			if (count >= demoLimit) {
				return fail(403, {
					message: `Limit: ${demoLimit} demos per month. Upgrade your plan for more.`
				});
			}
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
		const result = await enqueueDemoJob(user.id, prospectId);
		if (!result) {
			return fail(503, { message: 'Could not enqueue job. Is Supabase configured?' });
		}
		await updateProspectStatus(prospectId, 'In queue');
		return {
			queued: true,
			jobId: result.jobId,
			prospectId,
			companyName: prospect.companyName ?? undefined,
			alreadyQueued: !result.created
		};
	},
	generateDemo: async ({ request, url, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) {
			return fail(401, { message: 'Sign in required' });
		}
		const plan = await getPlanForUser(user);
		const demoLimit = getDemoCreationLimit(plan);
		if (demoLimit !== null) {
			const count = await getDemoCountThisMonth(user.id);
			if (count >= demoLimit) {
				return fail(403, {
					message: `Limit: ${demoLimit} demos per month. Upgrade your plan for more.`
				});
			}
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
		// Fetch scraped data (GBP) required for v0 demo generation.
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
		const v0Result = await generateDemoWithV0(prospect, gbpRaw, effectiveIndustry, tone);
		if (!v0Result.ok) {
			return fail(502, { message: v0Result.error ?? 'Demo generation failed. Try again.' });
		}
		(scrapedData as Record<string, unknown>).demoSource = 'v0';
		(scrapedData as Record<string, unknown>).v0DemoUrl = v0Result.demoUrl;
		const origin = getOriginForOutgoingLinks(url.origin);
		const demoUrl = `${origin}/demo/${prospectId}`;
		const result = await updateProspectDemoLink(prospectId, demoUrl, 'Demo Created');
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
	updateDemoStatus: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
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
	/** Regenerate demo content using v0 (or legacy landing content). Does not count against demo limit. */
	regenerateDemo: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
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
		const activeJob = await getActiveDemoJobForProspect(user.id, prospectId);
		if (activeJob) {
			return fail(409, {
				message: 'A demo is already being created for this prospect. Wait for it to finish or refresh the page.'
			});
		}
		let scrapedData = await getScrapedDataForProspectForUser(user.id, prospectId);
		if (!scrapedData) {
			const scrapedResult = await getScrapedDataForDemo(prospect);
			if (!scrapedResult.ok) {
				return fail(503, { message: formatScrapedDataErrorMessage(scrapedResult.errors) });
			}
			scrapedData = scrapedResult.data as Record<string, unknown>;
		} else {
			scrapedData = { ...scrapedData };
		}
		const gbpRaw = scrapedData.gbpRaw as import('$lib/server/gbp').GbpData | undefined;
		const tone = (scrapedData.tone as ToneSlug | undefined) ?? DEFAULT_TONE;
		const effectiveIndustry =
			(gbpRaw?.industry?.trim() && gbpRaw.industry !== 'General' ? gbpRaw.industry : null) ||
			prospect.industry?.trim() ||
			'Professional';

		if (!gbpRaw) {
			return fail(400, {
				message: 'GBP data is required to regenerate. Run "Pull insights" first.'
			});
		}
		const v0Result = await generateDemoWithV0(prospect, gbpRaw, effectiveIndustry, tone);
		if (!v0Result.ok) {
			return fail(502, { message: v0Result.error ?? 'Regeneration failed. Try again.' });
		}
		(scrapedData as Record<string, unknown>).demoSource = 'v0';
		(scrapedData as Record<string, unknown>).v0DemoUrl = v0Result.demoUrl;

		const supabase = getSupabaseAdmin();
		if (!supabase) {
			return fail(503, { message: 'Demo tracking not configured' });
		}
		const existing = await getDemoTrackingForProspect(user.id, prospectId);
		const currentStatus = existing?.status ?? 'draft';
		const result = await updateDemoTrackingStatus(user.id, prospectId, {
			status: isValidDemoTrackingStatus(currentStatus) ? currentStatus : 'draft',
			scrapedData
		});
		if (!result.ok) {
			return fail(502, { message: result.error ?? 'Failed to save' });
		}
		const scrapedSummary = buildScrapedSummary(scrapedData);
		return { success: true, prospectId, scrapedSummary };
	},
	bulkApproveDemos: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
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
	bulkGenerateDemos: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) {
			return fail(401, { message: 'Sign in required' });
		}
		const plan = await getPlanForUser(user);
		const demoLimit = getDemoCreationLimit(plan);
		const countThisMonth = await getDemoCountThisMonth(user.id);
		if (demoLimit !== null && countThisMonth >= demoLimit) {
			return fail(403, {
				message: `Limit: ${demoLimit} demos per month. Upgrade your plan for more.`
			});
		}
		const formData = await request.formData();
		const prospectIds = formData.getAll('prospectId') as string[];
		if (prospectIds.length === 0) {
			return fail(400, { message: 'Select at least one prospect' });
		}
		let queued = 0;
		const errors: string[] = [];
		for (const prospectId of prospectIds) {
			if (demoLimit !== null && countThisMonth + queued >= demoLimit) break;
			const prospect = await getProspectById(prospectId);
			if (!prospect) continue;
			if (prospect.flagged) continue;
			if (prospect.demoLink) continue;
			const result = await enqueueDemoJob(user.id, prospectId);
			if (!result) {
				errors.push(`${prospect.companyName || prospectId}: Could not enqueue`);
				continue;
			}
			if (result.created) queued++;
			await updateProspectStatus(prospectId, 'In queue');
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
	sendDemos: async ({ request, url, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) {
			return fail(401, { message: 'Sign in required' });
		}
		const plan = await getPlanForUser(user);
		if (!canSendAutomated(plan)) {
			return fail(403, { message: 'Automated send is available on Pro and Agency plans.' });
		}
		if (!(await getSendConfigured(user.id))) {
			return fail(503, { message: 'Email sending is not configured. Connect Gmail in Integrations or set RESEND_API_KEY.' });
		}
		const formData = await request.formData();
		if (formData.get('aupConfirmed') !== 'on') {
			return fail(400, { message: 'You must confirm compliance with the Acceptable Use Policy before sending.' });
		}
		const prospectIds = formData.getAll('prospectId');
		if (prospectIds.length === 0) {
			return fail(400, { message: 'Select at least one prospect to send.' });
		}
		serverInfo('sendDemos', 'Started', { prospectCount: prospectIds.length });
		const templates = await getTemplates(user.id);
		const [senderName, emailSignatureOverride] = await Promise.all([
			getEffectiveEmailSenderName(user.id, user.email),
			getEmailSignatureOverride(user.id)
		]);
		const supabase = getSupabaseAdmin();
		let sent = 0;
		const errors: string[] = [];
		for (const id of prospectIds) {
			if (typeof id !== 'string') continue;
			const prospect = await getProspectById(id);
			if (!prospect?.demoLink || prospect.flagged) continue;
			const demoLink = prospect.demoLink;
			let anySent = false;
			if (prospect.email?.trim()) {
				const linkOrigin = getOriginForOutgoingLinks(url.origin);
				const aiCopy = await generateEmailCopy(prospect, senderName);
				const subject = aiCopy?.subject ?? getDefaultEmailSubject(prospect.companyName || 'your business');
				const html = aiCopy
					? buildEmailBodyFromAiIntro(
							prospect,
							demoLink,
							senderName,
							linkOrigin,
							aiCopy.bodyIntro,
							emailSignatureOverride
						)
					: buildEmailBodyForUser(
							prospect,
							demoLink,
							senderName,
							linkOrigin,
							templates.emailHtml
						);
				const result = await sendEmail(prospect.email.trim(), subject, html, {
					userId: user.id,
					appUserEmail: user.email
				});
				if (result.ok) {
					sent++;
					anySent = true;
					serverInfo('sendDemos', 'Email sent', { to: prospect.email.trim(), prospectId: id });
				} else {
					errors.push(`${prospect.companyName || id}: ${result.error}`);
					serverError('sendDemos', result.error, { to: prospect.email.trim(), prospectId: id });
				}
			}
			if (prospect.phone?.trim() && isTwilioConfigured()) {
				const body = buildSmsBody(prospect, demoLink, senderName);
				const result = await sendSms(prospect.phone.trim(), body);
				if (result.ok) {
					sent++;
					anySent = true;
				} else {
					errors.push(`SMS ${prospect.companyName || id}: ${result.error}`);
				}
			}
			if (anySent && supabase) {
				await updateDemoTrackingStatus(user.id, id, { status: 'sent' });
			}
			if (!prospect.email?.trim() && !prospect.phone?.trim()) {
				errors.push(`${prospect.companyName || id}: No email or phone`);
			}
		}
		if (sent === 0 && errors.length > 0) {
			serverError('sendDemos', 'No emails sent', { sent, errors });
			return fail(502, { message: errors.slice(0, 3).join('; ') });
		}
		serverInfo('sendDemos', 'Completed', { sent, total: prospectIds.length, errors: errors.length > 0 ? errors : undefined });
		return {
			success: true,
			sent,
			total: prospectIds.length,
			errors: errors.length > 0 ? errors.slice(0, 5) : undefined
		};
	},
	deleteProspect: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Sign in required' });
		const formData = await request.formData();
		const prospectId = formData.get('prospectId');
		if (!prospectId || typeof prospectId !== 'string') return fail(400, { message: 'Missing prospect ID' });
		const result = await deleteProspect(user.id, prospectId);
		if (!result.ok) return fail(result.error === 'Prospect not found or access denied' ? 404 : 502, { message: result.error ?? 'Failed to delete' });
		return { success: true, prospectId };
	},
	/** Bulk enqueue GBP jobs for selected prospects (GBP queue tab). Inserts into gbp_jobs (status pending); cron processes them. */
	bulkEnqueueGbp: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
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
				await updateProspectStatus(prospectId, 'In queue');
			} else {
				enqueueFailed++;
			}
		}
		return { success: true, queued, total: prospectIds.length, skipped, enqueueFailed };
	},
	/** Bulk enqueue Insights jobs for selected prospects (Insights queue tab). */
	bulkEnqueueInsights: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
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
				await updateProspectStatus(prospectId, 'In queue');
			}
		}
		return { success: true, queued, total: prospectIds.length };
	},
	/** Soft delete: set flagged = true (moves to Deleted/not fit). */
	setFlagged: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Sign in required' });
		const formData = await request.formData();
		const prospectId = formData.get('prospectId');
		if (!prospectId || typeof prospectId !== 'string') return fail(400, { message: 'Missing prospect ID' });
		const result = await setProspectFlagged(user.id, prospectId, true);
		if (!result.ok) return fail(502, { message: result.error ?? 'Failed to update' });
		return { success: true, prospectId };
	},
	/** Restore: set flagged = false (removes from Deleted/not fit). */
	restoreProspect: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Sign in required' });
		const formData = await request.formData();
		const prospectId = formData.get('prospectId');
		if (!prospectId || typeof prospectId !== 'string') return fail(400, { message: 'Missing prospect ID' });
		const result = await setProspectFlagged(user.id, prospectId, false);
		if (!result.ok) return fail(502, { message: result.error ?? 'Failed to restore' });
		return { success: true, prospectId };
	},
	/** Bulk restore: set flagged = false for selected prospects (Deleted tab). */
	bulkRestore: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Sign in required' });
		const formData = await request.formData();
		const prospectIds = formData.getAll('prospectId') as string[];
		if (prospectIds.length === 0) return fail(400, { message: 'Select at least one prospect' });
		let restored = 0;
		for (const prospectId of prospectIds) {
			const result = await setProspectFlagged(user.id, prospectId, false);
			if (result.ok) restored++;
		}
		return { success: true, restored, total: prospectIds.length };
	},
	/**
	 * Clear "In queue" status for prospects that have no active job (demo, GBP, or insights).
	 * Use when prospects appear stuck in queue (e.g. cron not running or jobs already finished).
	 */
	clearStuckQueueStatus: async ({ cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Sign in required' });
		const result = await listProspects(user.id);
		const prospects = result.prospects ?? [];
		const [demoJobsByProspectId, gbpJobsByProspectId, insightsJobsByProspectId] = await Promise.all([
			getDemoJobsForUser(user.id),
			getGbpJobsForUser(user.id),
			getInsightsJobsForUser(user.id)
		]);
		let cleared = 0;
		for (const p of prospects) {
			if ((p.status ?? '').trim() !== 'In queue') continue;
			const hasDemoJob =
				demoJobsByProspectId[p.id]?.status === 'pending' || demoJobsByProspectId[p.id]?.status === 'creating';
			const hasGbpJob = gbpJobsByProspectId[p.id]?.status === 'pending';
			const hasInsightsJob = insightsJobsByProspectId[p.id]?.status === 'pending';
			if (!hasDemoJob && !hasGbpJob && !hasInsightsJob) {
				await updateProspectStatus(p.id, 'Prospect');
				cleared++;
			}
		}
		return { success: true, cleared };
	}
};
