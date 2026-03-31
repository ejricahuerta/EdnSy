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
	enqueueInsightsJob,
	enqueueGbpJob,
	getInsightsJobForProspect,
	getGbpJobForProspect
} from '$lib/server/supabase';
import type { PageServerLoad, Actions } from './$types';
import { getDashboardSessionUser } from '$lib/server/authDashboard';
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
import { deleteProspect, updateProspectContact } from '$lib/server/prospects';

export const load: PageServerLoad = async (event) => {
	const { params, cookies } = event;
	const user = await getDashboardSessionUser(event);
	if (!user) throw redirect(303, '/auth/login');

	const prospectId = params.id;
	const prospect = await getProspectByIdForUser(user.id, prospectId);
	if (!prospect) throw redirect(303, '/dashboard/prospects');

	const [demoTracking, scrapedData, demoJobMap, insightsJob, gbpJob, plan, demoCountThisMonth, sendConfigured] =
		await Promise.all([
			getDemoTrackingForProspect(user.id, prospectId),
			getScrapedDataForProspect(prospectId),
			getDemoJobsForUser(user.id),
			getInsightsJobForProspect(user.id, prospectId),
			getGbpJobForProspect(user.id, prospectId),
			getPlanForUser(user),
			getDemoCountThisMonth(user.id),
			getSendConfigured(user.id)
		]);

	const demoLimit = getDemoCreationLimit(plan);
	const canSend = plan ? canSendAutomated(plan) : false;
	const demoJob = demoJobMap[prospectId] ?? null;

	return {
		user,
		prospect,
		demoTracking,
		scrapedData,
		demoJob,
		insightsJob: insightsJob?.status === 'pending' || insightsJob?.status === 'running' ? insightsJob : null,
		gbpJob: gbpJob?.status === 'pending' || gbpJob?.status === 'running' ? gbpJob : null,
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
	analyzeBusiness: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
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

	/** Regenerate GBP and insights: enqueue a GBP job to re-fetch listing data and re-run AI grading + insight. */
	regenerateGbpAndInsights: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		const formData = await request.formData();
		const prospectId = formData.get('prospectId');
		if (!prospectId || typeof prospectId !== 'string') {
			return fail(400, { message: 'Missing prospect ID' });
		}
		const prospect = await getProspectByIdForUser(user.id, prospectId);
		if (!prospect) return fail(404, { message: 'Prospect not found' });
		if (prospect.flagged && prospect.flaggedReason !== NO_FIT_GBP_REASON) {
			return fail(400, { message: 'This prospect is out of scope. Regeneration is not available.' });
		}
		const result = await enqueueGbpJob(user.id, prospectId);
		if (!result) return fail(502, { message: 'Failed to queue GBP job. Try again.' });
		return { queued: true, prospectId, companyName: prospect.companyName ?? undefined, alreadyQueued: !result.created };
	},

	enqueueDemo: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
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
		// Endpoint (dental vs generic) is determined by prospect.industry when the job runs in processDemoJob
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

	updateDemoStatus: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
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

	/** Set demo to approved so the user can send email. Only allowed when current status is draft. */
	approveDemo: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		const formData = await request.formData();
		const prospectId = formData.get('prospectId');
		if (!prospectId || typeof prospectId !== 'string') {
			return fail(400, { message: 'Missing prospect ID' });
		}
		const prospect = await getProspectByIdForUser(user.id, prospectId);
		if (!prospect) return fail(404, { message: 'Prospect not found' });
		if (!(prospect.demoLink ?? '').trim()) {
			return fail(400, { message: 'No demo to approve. Create a demo first.' });
		}
		let demoTracking = await getDemoTrackingForProspect(user.id, prospectId);
		if (!demoTracking) {
			// Legacy: prospect has demo link but no demo_tracking row; create one as approved so Send is available
			await upsertDemoTrackingForProspect(
				user.id,
				prospectId,
				prospect.provider ?? 'manual',
				prospect.provider_row_id ?? prospectId,
				(prospect.demoLink ?? '').trim(),
				'approved'
			);
			return { success: true, prospectId };
		}
		if (demoTracking.status !== 'draft') {
			return fail(400, { message: 'Demo is already approved or sent. No need to approve again.' });
		}
		const result = await updateDemoTrackingStatus(user.id, prospectId, { status: 'approved' });
		if (!result.ok) return fail(502, { message: result.error ?? 'Failed to approve demo' });
		return { success: true, prospectId };
	},

	/** Regenerate demo: enqueue a job so Claude runs one-at-a-time (avoids rate limit). */
	regenerateDemo: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
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
		// Endpoint (dental vs generic) is determined by prospect.industry when the job runs in processDemoJob
		const result = await enqueueDemoJob(user.id, prospectId);
		if (!result) {
			return fail(503, { message: 'Could not queue regeneration. Try again.' });
		}
		// Regenerating always resets tracking to draft (was approved or draft); callback also sets draft on completion.
		await updateDemoTrackingStatus(user.id, prospectId, { status: 'draft' });
		return { success: true, prospectId, queued: true, jobId: result.jobId, alreadyQueued: !result.created };
	},

	sendDemos: async (event) => {
		const { request, url, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		const plan = await getPlanForUser(user);
		if (!canSendAutomated(plan)) {
			return fail(403, { message: 'Automated send is available on Starter, Growth, and Agency plans.' });
		}
		if (!(await getSendConfigured(user.id))) {
			return fail(503, {
				message: 'Email sending is not configured. Connect Gmail in Integrations.'
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
		let demoTracking = await getDemoTrackingForProspect(user.id, prospectId);
		if (!demoTracking && (prospect.demoLink ?? '').trim()) {
			// Legacy: create demo_tracking as approved so send can proceed
			await upsertDemoTrackingForProspect(
				user.id,
				prospectId,
				prospect.provider ?? 'manual',
				prospect.provider_row_id ?? prospectId,
				(prospect.demoLink ?? '').trim(),
				'approved'
			);
			demoTracking = await getDemoTrackingForProspect(user.id, prospectId);
		}
		if (!demoTracking || demoTracking.status !== 'approved') {
			return fail(400, {
				message: 'Demo must be approved before sending. Open the prospect and click Approve demo.'
			});
		}
		const [senderName, emailSignatureOverride] = await Promise.all([
			getEffectiveEmailSenderName(user.id, user.email),
			getEmailSignatureOverride(user.id)
		]);
		const templates = await getTemplates(user.id);
		const linkOrigin = getOriginForOutgoingLinks(url.origin);
		let sent = 0;
		if (prospect.email?.trim()) {
			const ai = await generateEmailCopy(prospect, senderName);
			if (!ai.copy && ai.promptSource === 'override') {
				return fail(502, {
					message:
						ai.error ??
						'AI email generation failed while a custom Email AI prompt override is active. The email was not sent.'
				});
			}
			const subject =
				ai.copy?.subject ?? getDefaultEmailSubject(prospect.companyName || 'your business');
			const html = ai.copy
				? buildEmailBodyFromAiIntro(
						prospect,
						prospect.demoLink,
						senderName,
						linkOrigin,
						ai.copy.bodyIntro,
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
		if (sent === 0) {
			if (!(prospect.email ?? '').trim() && !(prospect.phone ?? '').trim()) {
				return fail(400, {
					message: 'No email or phone to send to. Add an email (or phone for SMS) on this prospect first.'
				});
			}
			return fail(502, { message: 'Email could not be sent. Check Integrations (Gmail) and try again.' });
		}
		return { success: true, sent, prospectId };
	},

	sendAlternateOffer: async (event) => {
		const { request, url, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		const plan = await getPlanForUser(user);
		if (!canSendAutomated(plan)) {
			return fail(403, { message: 'Automated send is available on Starter, Growth, and Agency plans.' });
		}
		if (!(await getSendConfigured(user.id))) {
			return fail(503, {
				message: 'Email sending is not configured. Connect Gmail in Integrations.'
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

	updateEmail: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		const formData = await request.formData();
		const prospectId = formData.get('prospectId');
		const email = (formData.get('email') as string)?.trim() ?? '';
		if (!prospectId || typeof prospectId !== 'string') return fail(400, { message: 'Missing prospect ID' });
		const result = await updateProspectContact(user.id, prospectId, { email });
		if (!result.ok) {
			return fail(
				result.error === 'Prospect not found or access denied' ? 404 : 502,
				{ message: result.error ?? 'Failed to update email' }
			);
		}
		return { success: true, prospectId, email };
	},

	deleteProspect: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
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
