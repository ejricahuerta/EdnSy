import { fail, redirect } from '@sveltejs/kit';
import { getProspectByIdForUser } from '$lib/server/prospects';
import {
	getDemoTrackingForProspect,
	getScrapedDataForProspect,
	getScrapedDataForProspectForUser,
	updateDemoTrackingStatus,
	enqueueDemoJob,
	getDemoJobsForUser,
	upsertDemoTrackingForProspect,
	getSupabaseAdmin,
	enqueueInsightsJob,
	enqueueGbpJob,
	getInsightsJobForProspect,
	getGbpJobForProspect,
	getGmailOutreachEventsForProspect
} from '$lib/server/supabase';
import type { PageServerLoad, Actions } from './$types';
import { getDashboardSessionUser } from '$lib/server/authDashboard';
import { isValidDemoTrackingStatus, type DemoTrackingStatus } from '$lib/demo';
import { NO_FIT_GBP_REASON } from '$lib/server/qualify';

/** True when prospect can run Pull insights / Create demo (including "no online presence" name-based path). */
function canRunInsightsAndDemo(prospect: { flagged?: boolean; flaggedReason?: string | null }): boolean {
	return !prospect.flagged || prospect.flaggedReason === NO_FIT_GBP_REASON;
}
import { getSendConfigured, getOriginForOutgoingLinks } from '$lib/server/send';
import { deleteProspect, updateProspectContact } from '$lib/server/prospects';
import { prepareCrmOutreachEmail, type CrmOutreachKind } from '$lib/server/crmOutreachEmail';
import {
	executeCreateGmailOutreachDraft,
	executeSendGmailOutreachDraft,
	parseOutreachDraftOverridesFromForm
} from '$lib/server/crmOutreachGmail';
import { DEV_OUTBOUND_EMAIL } from '$lib/constants';

export const load: PageServerLoad = async (event) => {
	const { params, cookies } = event;
	const user = await getDashboardSessionUser(event);
	if (!user) throw redirect(303, '/auth/login');

	const prospectId = params.id;
	const prospect = await getProspectByIdForUser(user.id, prospectId);
	if (!prospect) throw redirect(303, '/dashboard/prospects');

	const [demoTracking, scrapedData, demoJobMap, insightsJob, gbpJob, sendConfigured, gmailOutreachEvents] =
		await Promise.all([
			getDemoTrackingForProspect(user.id, prospectId),
			getScrapedDataForProspect(prospectId),
			getDemoJobsForUser(user.id),
			getInsightsJobForProspect(user.id, prospectId),
			getGbpJobForProspect(user.id, prospectId),
			getSendConfigured(user.id),
			getGmailOutreachEventsForProspect(prospectId)
		]);

	const demoJob = demoJobMap[prospectId] ?? null;

	return {
		user,
		prospect,
		demoTracking,
		scrapedData,
		demoJob,
		insightsJob: insightsJob?.status === 'pending' || insightsJob?.status === 'running' ? insightsJob : null,
		gbpJob: gbpJob?.status === 'pending' || gbpJob?.status === 'running' ? gbpJob : null,
		sendConfigured,
		canSend: sendConfigured,
		showInsightsAndDemo: canRunInsightsAndDemo(prospect),
		gmailOutreachEvents
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

	/** Load outreach email preview for the modal (no Gmail API call). */
	previewOutreachEmail: async (event) => {
		const { request, url } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		const formData = await request.formData();
		const prospectId = formData.get('prospectId');
		const kindRaw = formData.get('outreachKind');
		if (!prospectId || typeof prospectId !== 'string') {
			return fail(400, { message: 'Missing prospect ID' });
		}
		const kind: CrmOutreachKind =
			kindRaw === 'alternate' ? 'alternate' : kindRaw === 'demo' ? 'demo' : 'demo';
		const prospect = await getProspectByIdForUser(user.id, prospectId);
		if (!prospect) return fail(404, { message: 'Prospect not found' });
		if (prospect.flagged && prospect.flaggedReason !== NO_FIT_GBP_REASON) {
			return fail(400, { message: 'Prospect out of scope.' });
		}
		if (kind === 'demo') {
			if (!prospect.demoLink) {
				return fail(400, { message: 'No demo link. Create a demo first.' });
			}
			const demoTracking = await getDemoTrackingForProspect(user.id, prospectId);
			if (
				demoTracking &&
				demoTracking.status !== 'approved' &&
				demoTracking.status !== 'email_draft'
			) {
				return fail(400, {
					message: 'Demo must be approved (or already have a draft) before creating a Gmail draft.'
				});
			}
		}
		const linkOrigin = getOriginForOutgoingLinks(url.origin);
		const prepared = await prepareCrmOutreachEmail({
			kind,
			prospect,
			userId: user.id,
			appUserEmail: user.email,
			linkOrigin
		});
		if (!prepared.ok) return fail(502, { message: prepared.error });
		const toDisplay = prepared.devRedirect ? DEV_OUTBOUND_EMAIL : prepared.originalTo;
		return {
			preview: true as const,
			subject: prepared.subject,
			html: prepared.html,
			toDisplay,
			kind: prepared.kind,
			devRedirect: prepared.devRedirect,
			prospectId
		};
	},

	/** Create or replace a Gmail draft (demo with demo link, or alternate offer). */
	createGmailOutreachDraft: async (event) => {
		const { request, url } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		if (!(await getSendConfigured(user.id))) {
			return fail(503, {
				message: 'Gmail is not connected. Connect Gmail in Dashboard → Integrations (include draft access).'
			});
		}
		const formData = await request.formData();
		if (formData.get('aupConfirmed') !== 'on') {
			return fail(400, {
				message: 'You must confirm compliance with the Acceptable Use Policy before creating a draft.'
			});
		}
		const prospectId = formData.get('prospectId');
		const kindRaw = formData.get('outreachKind');
		if (!prospectId || typeof prospectId !== 'string') {
			return fail(400, { message: 'Missing prospect ID' });
		}
		const kind: CrmOutreachKind = kindRaw === 'alternate' ? 'alternate' : 'demo';
		const prospect = await getProspectByIdForUser(user.id, prospectId);
		if (!prospect) return fail(404, { message: 'Prospect not found' });
		if (prospect.flagged && prospect.flaggedReason !== NO_FIT_GBP_REASON) {
			return fail(400, { message: 'Prospect out of scope.' });
		}
		const linkOrigin = getOriginForOutgoingLinks(url.origin);
		let demoTracking = await getDemoTrackingForProspect(user.id, prospectId);

		if (kind === 'demo') {
			if (!prospect.demoLink) {
				return fail(400, { message: 'No demo link or prospect out of scope.' });
			}
			if (!demoTracking && (prospect.demoLink ?? '').trim()) {
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
			if (
				!demoTracking ||
				(demoTracking.status !== 'approved' && demoTracking.status !== 'email_draft')
			) {
				return fail(400, {
					message: 'Demo must be approved before creating a Gmail draft. Open the prospect and click Approve demo.'
				});
			}
		} else if (!prospect.email?.trim()) {
			return fail(400, { message: 'No email to send to.' });
		}
		if (kind === 'demo' && !(prospect.email ?? '').trim()) {
			return fail(400, { message: 'No email to send to.' });
		}

		const overridesParsed = parseOutreachDraftOverridesFromForm(formData);
		if (!overridesParsed.ok) {
			return fail(400, { message: overridesParsed.error });
		}
		const draftOverrides = overridesParsed.overrides;

		let sent = 0;
		if (prospect.email?.trim()) {
			const ex = await executeCreateGmailOutreachDraft({
				userId: user.id,
				appUserEmail: user.email,
				prospect,
				prospectId,
				kind,
				linkOrigin,
				setDemoTrackingEmailDraft: kind === 'demo' && !!demoTracking,
				...(draftOverrides ? { draftOverrides } : {})
			});
			if (!ex.ok) return fail(502, { message: ex.error });
			sent++;
		}
		if (sent === 0) {
			if (!(prospect.email ?? '').trim()) {
				return fail(400, {
					message: 'No email to reach. Add an email on this prospect first.'
				});
			}
			return fail(502, {
				message: 'Could not create Gmail draft. Check Integrations and reconnect Gmail if needed.'
			});
		}
		return { success: true, sent, prospectId, draftCreated: true };
	},

	/** Send the stored Gmail draft via Gmail API (drafts.send). */
	sendGmailOutreachDraft: async (event) => {
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
		const prospectId = formData.get('prospectId');
		if (!prospectId || typeof prospectId !== 'string') {
			return fail(400, { message: 'Missing prospect ID' });
		}
		const prospect = await getProspectByIdForUser(user.id, prospectId);
		if (!prospect) return fail(404, { message: 'Prospect not found' });
		const ex = await executeSendGmailOutreachDraft({
			userId: user.id,
			prospect,
			prospectId
		});
		if (!ex.ok) return fail(502, { message: ex.error });
		return { success: true, prospectId, messageId: ex.messageId };
	},

	updateEmail: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user) return fail(401, { message: 'Sign in required' });
		const formData = await request.formData();
		const prospectId = formData.get('prospectId');
		const email = (formData.get('email') as string)?.trim() ?? '';
		if (!prospectId || typeof prospectId !== 'string') return fail(400, { message: 'Missing prospect ID' });
		const result = await updateProspectContact(prospectId, { email });
		if (!result.ok) {
			return fail(
				result.error === 'Prospect not found' || result.error === 'Prospect not found or access denied'
					? 404
					: 502,
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
		const result = await deleteProspect(prospectId);
		if (!result.ok) {
			return fail(
				result.error === 'Prospect not found' || result.error === 'Prospect not found or access denied'
					? 404
					: 502,
				{ message: result.error ?? 'Failed to delete' }
			);
		}
		return { success: true, prospectId };
	}
};
