import { fail, redirect } from '@sveltejs/kit';
import { getProspectByIdForUser } from '$lib/server/prospects';
import {
	getDemoTrackingForProspect,
	getScrapedDataForProspect,
	getScrapedDataForProspectForUser,
	updateDemoTrackingStatus,
	enqueueDemoJob,
	getDemoJobsForUser,
	getDemoCountThisMonth,
	upsertDemoTrackingForProspect,
	getSupabaseAdmin,
	getActiveDemoJobForProspect,
	enqueueInsightsJob,
	getInsightsJobForProspect
} from '$lib/server/supabase';
import { getScrapedDataForDemo, formatScrapedDataErrorMessage } from '$lib/server/gbp';
import { generateDemoWithV0 } from '$lib/server/v0GenerateDemo';
import { DEFAULT_TONE } from '$lib/tones';
import type { ToneSlug } from '$lib/tones';
import type { PageServerLoad, Actions } from './$types';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';
import { getEffectiveEmailSenderName, getEmailSignatureOverride } from '$lib/server/userSettings';
import { getPlanForUser } from '$lib/server/stripe';
import { getDemoCreationLimit, canSendAutomated } from '$lib/plans';
import { isValidDemoTrackingStatus, type DemoTrackingStatus } from '$lib/demo';
import { NO_FIT_GBP_REASON } from '$lib/server/qualify';

/** True when prospect can run Pull insights / Create demo (including "no online presence" name-based path). */
function canRunInsightsAndDemo(prospect: { flagged?: boolean; flaggedReason?: string | null }): boolean {
	return !prospect.flagged || prospect.flaggedReason === NO_FIT_GBP_REASON;
}
import {
	sendEmail,
	sendSms,
	getDefaultEmailSubject,
	getAlternateOfferSubject,
	buildEmailBodyForUser,
	buildEmailBodyFromAiIntro,
	buildEmailBodyAlternateOffer,
	buildSmsBody,
	getSendConfigured,
	getOriginForOutgoingLinks,
	isTwilioConfigured
} from '$lib/server/send';
import { generateEmailCopy } from '$lib/server/generateEmailCopy';
import { getTemplates } from '$lib/server/templates';
import { deleteProspect } from '$lib/server/prospects';

export const load: PageServerLoad = async ({ params, cookies }) => {
	const cookie = cookies.get(getSessionCookieName());
	const user = await getSessionFromCookie(cookie);
	if (!user) throw redirect(303, '/auth/login');

	const prospectId = params.id;
	const prospect = await getProspectByIdForUser(user.id, prospectId);
	if (!prospect) throw redirect(303, '/dashboard/prospects');

	const [demoTracking, scrapedData, demoJobMap, insightsJob, plan, demoCountThisMonth, sendConfigured] =
		await Promise.all([
			getDemoTrackingForProspect(user.id, prospectId),
			getScrapedDataForProspect(prospectId),
			getDemoJobsForUser(user.id),
			getInsightsJobForProspect(user.id, prospectId),
			getPlanForUser(user),
			getDemoCountThisMonth(user.id),
			getSendConfigured(user.id)
		]);

	const demoLimit = getDemoCreationLimit(plan);
	const canSend = plan ? canSendAutomated(plan) : false;
	const demoJob = demoJobMap[prospectId] ?? null;

	return {
		prospect,
		demoTracking,
		scrapedData,
		demoJob,
		insightsJob: insightsJob?.status === 'pending' || insightsJob?.status === 'running' ? insightsJob : null,
		plan,
		demoLimit,
		demoCountThisMonth: demoCountThisMonth ?? 0,
		sendConfigured,
		canSend: canSend && sendConfigured,
		atDemoLimit:
			demoLimit !== null && demoLimit > 0 && (demoCountThisMonth ?? 0) >= demoLimit,
		showInsightsAndDemo: canRunInsightsAndDemo(prospect)
	};
};

export const actions: Actions = {
	analyzeBusiness: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Sign in required' });
		const formData = await request.formData();
		const prospectId = formData.get('prospectId');
		if (!prospectId || typeof prospectId !== 'string') {
			return fail(400, { message: 'Missing prospect ID' });
		}
		const prospect = await getProspectByIdForUser(user.id, prospectId);
		if (!prospect) return fail(404, { message: 'Prospect not found' });
		if (prospect.flagged && prospect.flaggedReason !== NO_FIT_GBP_REASON) {
			return fail(400, { message: 'This prospect is out of scope. Analysis is not available.' });
		}
		const enqueued = await enqueueInsightsJob(user.id, prospectId);
		if (!enqueued) return fail(502, { message: 'Failed to queue insights job. Try again.' });
		return { queued: true, prospectId, companyName: prospect.companyName ?? undefined };
	},

	enqueueDemo: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Sign in required' });
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
		const prospect = await getProspectByIdForUser(user.id, prospectId);
		if (!prospect) return fail(404, { message: 'Prospect not found' });
		if (prospect.flagged && prospect.flaggedReason !== NO_FIT_GBP_REASON) {
			return fail(400, { message: 'This prospect is out of scope. Demos and GBP are not available.' });
		}
		if (prospect.demoLink) return fail(400, { message: 'Demo already created' });
		const result = await enqueueDemoJob(user.id, prospectId);
		if (!result) return fail(503, { message: 'Could not enqueue job. Is Supabase configured?' });
		return {
			queued: true,
			jobId: result.jobId,
			prospectId,
			companyName: prospect.companyName ?? undefined,
			alreadyQueued: !result.created
		};
	},

	updateDemoStatus: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Sign in required' });
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
		if (!result.ok) return fail(502, { message: result.error ?? 'Failed to update demo status' });
		return { success: true, prospectId, status };
	},

	/** Regenerate demo using v0 path (or legacy landing content). */
	regenerateDemo: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Sign in required' });
		const formData = await request.formData();
		const prospectId = formData.get('prospectId');
		if (!prospectId || typeof prospectId !== 'string') {
			return fail(400, { message: 'Missing prospect ID' });
		}
		const prospect = await getProspectByIdForUser(user.id, prospectId);
		if (!prospect) return fail(404, { message: 'Prospect not found' });
		if (prospect.flagged && prospect.flaggedReason !== NO_FIT_GBP_REASON) {
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
			const { getScrapedDataForDemoFromNameOnly } = await import('$lib/server/gbp');
			let scrapedResult = await getScrapedDataForDemo(prospect);
			if (!scrapedResult.ok && scrapedResult.errors?.dataforseo) {
				scrapedResult = await getScrapedDataForDemoFromNameOnly(prospect);
			}
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

		if (!getSupabaseAdmin()) {
			return fail(503, { message: 'Demo tracking not configured' });
		}
		const existing = await getDemoTrackingForProspect(user.id, prospectId);
		const currentStatus = existing?.status ?? 'draft';
		const result = await updateDemoTrackingStatus(user.id, prospectId, {
			status: isValidDemoTrackingStatus(currentStatus) ? currentStatus : 'draft',
			scrapedData
		});
		if (!result.ok) return fail(502, { message: result.error ?? 'Failed to save' });
		return { success: true, prospectId };
	},

	sendDemos: async ({ request, url, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Sign in required' });
		const plan = await getPlanForUser(user);
		if (!canSendAutomated(plan)) {
			return fail(403, { message: 'Automated send is available on Pro and Agency plans.' });
		}
		if (!(await getSendConfigured(user.id))) {
			return fail(503, {
				message: 'Email sending is not configured. Connect Gmail in Integrations or set RESEND_API_KEY.'
			});
		}
		const formData = await request.formData();
		if (formData.get('aupConfirmed') !== 'on') {
			return fail(400, {
				message: 'You must confirm compliance with the Acceptable Use Policy before sending.'
			});
		}
		const prospectIds = formData.getAll('prospectId');
		if (prospectIds.length === 0) {
			return fail(400, { message: 'Select at least one prospect to send.' });
		}
		const prospectId = prospectIds[0] as string;
		const prospect = await getProspectByIdForUser(user.id, prospectId);
		if (!prospect) return fail(404, { message: 'Prospect not found' });
		if (!prospect.demoLink || (prospect.flagged && prospect.flaggedReason !== NO_FIT_GBP_REASON)) {
			return fail(400, { message: 'No demo link or prospect out of scope.' });
		}
		const [senderName, emailSignatureOverride] = await Promise.all([
			getEffectiveEmailSenderName(user.id, user.email),
			getEmailSignatureOverride(user.id)
		]);
		const templates = await getTemplates(user.id);
		const linkOrigin = getOriginForOutgoingLinks(url.origin);
		let sent = 0;
		if (prospect.email?.trim()) {
			const aiCopy = await generateEmailCopy(prospect, senderName);
			const subject =
				aiCopy?.subject ?? getDefaultEmailSubject(prospect.companyName || 'your business');
			const html = aiCopy
				? buildEmailBodyFromAiIntro(
						prospect,
						prospect.demoLink,
						senderName,
						linkOrigin,
						aiCopy.bodyIntro,
						emailSignatureOverride
					)
				: buildEmailBodyForUser(
						prospect,
						prospect.demoLink,
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
				await updateDemoTrackingStatus(user.id, prospectId, { status: 'sent' });
			} else {
				return fail(502, { message: result.error });
			}
		}
		if (prospect.phone?.trim() && isTwilioConfigured()) {
			const body = buildSmsBody(prospect, prospect.demoLink, senderName);
			const result = await sendSms(prospect.phone.trim(), body);
			if (result.ok) sent++;
		}
		if (sent === 0 && !prospect.email?.trim() && !prospect.phone?.trim()) {
			return fail(400, { message: 'No email or phone to send to.' });
		}
		return { success: true, sent, prospectId };
	},

	sendAlternateOffer: async ({ request, url, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Sign in required' });
		const plan = await getPlanForUser(user);
		if (!canSendAutomated(plan)) {
			return fail(403, { message: 'Automated send is available on Pro and Agency plans.' });
		}
		if (!(await getSendConfigured(user.id))) {
			return fail(503, {
				message: 'Email sending is not configured. Connect Gmail in Integrations or set RESEND_API_KEY.'
			});
		}
		const formData = await request.formData();
		if (formData.get('aupConfirmed') !== 'on') {
			return fail(400, {
				message: 'You must confirm compliance with the Acceptable Use Policy before sending.'
			});
		}
		const prospectId = formData.get('prospectId');
		if (!prospectId || typeof prospectId !== 'string') {
			return fail(400, { message: 'Missing prospect ID' });
		}
		const prospect = await getProspectByIdForUser(user.id, prospectId);
		if (!prospect) return fail(404, { message: 'Prospect not found' });
		if (prospect.flagged && prospect.flaggedReason !== NO_FIT_GBP_REASON) {
			return fail(400, { message: 'Prospect out of scope.' });
		}
		if (!prospect.email?.trim()) {
			return fail(400, { message: 'No email to send to.' });
		}
		const [senderName] = await Promise.all([
			getEffectiveEmailSenderName(user.id, user.email)
		]);
		const linkOrigin = getOriginForOutgoingLinks(url.origin);
		const subject = getAlternateOfferSubject(prospect.companyName || 'your business');
		const html = buildEmailBodyAlternateOffer(prospect, senderName, linkOrigin);
		const result = await sendEmail(prospect.email.trim(), subject, html, {
			userId: user.id,
			appUserEmail: user.email
		});
		if (!result.ok) return fail(502, { message: result.error });
		return { success: true, prospectId };
	},

	deleteProspect: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Sign in required' });
		const formData = await request.formData();
		const prospectId = formData.get('prospectId');
		if (!prospectId || typeof prospectId !== 'string') {
			return fail(400, { message: 'Missing prospect ID' });
		}
		const result = await deleteProspect(user.id, prospectId);
		if (!result.ok) {
			return fail(
				result.error === 'Prospect not found or access denied' ? 404 : 502,
				{ message: result.error ?? 'Failed to delete' }
			);
		}
		return { success: true, prospectId };
	}
};
