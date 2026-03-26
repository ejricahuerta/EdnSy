import { fail, redirect } from '@sveltejs/kit';
import {
	listProspects,
	getProspectById,
	updateProspectDemoLink,
	updateProspectFromGbp,
	updateProspectStatus
} from '$lib/server/prospects';
import {
	getSupabaseAdmin,
	getDemoCountThisMonth,
	getDemoTrackingForUser,
	getGbpCountThisMonth,
	getInsightsCountThisMonth,
	getPlacesCountThisMonth,
	getPlacesMonthlyLimit,
	updateDemoTrackingStatus,
	upsertDemoTrackingForProspect,
	enqueueDemoJob
} from '$lib/server/supabase';
import { getScrapedDataForDemo, formatScrapedDataErrorMessage } from '$lib/server/gbp';
import type { PageServerLoad, Actions } from './$types';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';
import { env } from '$env/dynamic/private';
import { getCrmIndustryFilter, getGbpDefaultLocation, getEffectiveEmailSenderName, getEmailSignatureOverride } from '$lib/server/userSettings';
import { isValidDemoTrackingStatus } from '$lib/demo';
import { getPlanForUser, getUpcomingInvoiceForUser } from '$lib/server/stripe';
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
import { PROSPECT_STATUS } from '$lib/prospectStatus';

export const load: PageServerLoad = async ({ cookies }) => {
	const cookie = cookies.get(getSessionCookieName());
	const user = await getSessionFromCookie(cookie);
	if (!user) {
		throw redirect(303, '/auth/login');
	}
	const plan = await getPlanForUser(user);
	const demoLimit = getDemoCreationLimit(plan);
	const [demoCountThisMonth, gbpCountThisMonth, insightsCountThisMonth, placesCountThisMonth] =
		await Promise.all([
			getDemoCountThisMonth(user.id),
			getGbpCountThisMonth(user.id),
			getInsightsCountThisMonth(user.id),
			getPlacesCountThisMonth()
		]);
	const placesMonthlyLimit = getPlacesMonthlyLimit();

	return {
		user,
		plan,
		demoLimit,
		demoCountThisMonth,
		gbpCountThisMonth,
		insightsCountThisMonth,
		placesCountThisMonth,
		placesMonthlyLimit
	};
};

export const actions: Actions = {
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
			return fail(400, { message: 'This client is out of scope. Demos and GBP are not available.' });
		}
		if (prospect.demoLink) {
			return fail(400, { message: 'Demo already created' });
		}
		const scrapedResult = await getScrapedDataForDemo(prospect);
		if (!scrapedResult.ok) {
			return fail(503, { message: formatScrapedDataErrorMessage(scrapedResult.errors) });
		}
		const scrapedData = scrapedResult.data;
		const origin = url.origin;
		const demoUrl = `${origin}/demo/${prospectId}`;
		const result = await updateProspectDemoLink(prospectId, demoUrl, PROSPECT_STATUS.REVIEW);
		if (!result.ok) {
			return fail(502, { message: result.error ?? 'Failed to update prospect' });
		}
		const supabase = getSupabaseAdmin();
		if (supabase) {
			const crmSource = prospect.provider ?? 'manual';
			const crmProspectId = prospect.provider_row_id ?? prospectId;
			await upsertDemoTrackingForProspect(
				user.id,
				prospectId,
				crmSource,
				crmProspectId,
				demoUrl,
				'draft'
			);
		}
		if (supabase) {
			await updateDemoTrackingStatus(user.id, prospectId, {
				status: 'draft',
				scrapedData
			});
		}
		if ('gbpRaw' in scrapedData && scrapedData.gbpRaw) {
			await updateProspectFromGbp(prospectId, scrapedData.gbpRaw);
		}
		return { success: true, prospectId, demoLink: demoUrl };
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
	bulkApproveDemos: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) {
			return fail(401, { message: 'Sign in required' });
		}
		const formData = await request.formData();
		const prospectIds = formData.getAll('prospectId');
		if (prospectIds.length === 0) {
			return fail(400, { message: 'Select at least one client' });
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
	bulkGenerateDemos: async ({ request, url, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) {
			return fail(401, { message: 'Sign in required' });
		}
		const plan = await getPlanForUser(user);
		const demoLimit = getDemoCreationLimit(plan);
		let countThisMonth = await getDemoCountThisMonth(user.id);
		if (demoLimit !== null && countThisMonth >= demoLimit) {
			return fail(403, {
				message: `Limit: ${demoLimit} demos per month. Upgrade your plan for more.`
			});
		}
		const formData = await request.formData();
		const prospectIds = formData.getAll('prospectId') as string[];
		if (prospectIds.length === 0) {
			return fail(400, { message: 'Select at least one client' });
		}
		const supabase = getSupabaseAdmin();
		if (!supabase) {
			return fail(503, { message: 'Demo tracking not configured. Supabase is required for bulk demo creation.' });
		}
		const origin = getOriginForOutgoingLinks(url.origin);
		const defaultLocation = await getGbpDefaultLocation(user.id);
		let enqueued = 0;
		const errors: string[] = [];
		for (const prospectId of prospectIds) {
			if (demoLimit !== null && countThisMonth >= demoLimit) break;
			const prospect = await getProspectById(prospectId);
			if (!prospect) continue;
			if (prospect.flagged) continue;
			if (prospect.demoLink) continue;
			const scrapedResult = await getScrapedDataForDemo(prospect, {
				defaultLocation: defaultLocation ?? undefined
			});
			if (!scrapedResult.ok) {
				errors.push(`${prospect.companyName || prospectId}: ${formatScrapedDataErrorMessage(scrapedResult.errors)}`);
				continue;
			}
			const scrapedData = scrapedResult.data as Record<string, unknown>;
			const demoUrl = `${origin}/demo/${prospectId}`;
			const crmSource = prospect.provider ?? 'manual';
			const crmProspectId = prospect.provider_row_id ?? prospectId;
			await upsertDemoTrackingForProspect(user.id, prospectId, crmSource, crmProspectId, demoUrl, 'draft');
			await updateDemoTrackingStatus(user.id, prospectId, { status: 'draft', scrapedData });
			if (scrapedData?.gbpRaw && typeof scrapedData.gbpRaw === 'object') {
				await updateProspectFromGbp(prospectId, scrapedData.gbpRaw as { phone?: string; website?: string; address?: string; industry?: string });
			}
			const enqueueResult = await enqueueDemoJob(user.id, prospectId);
			if (!enqueueResult) {
				errors.push(`${prospect.companyName || prospectId}: Could not enqueue job`);
				continue;
			}
			await updateProspectStatus(prospectId, PROSPECT_STATUS.DEMO_QUEUED);
			enqueued++;
			countThisMonth++;
		}
		if (enqueued === 0 && errors.length > 0) {
			return fail(502, { message: errors.slice(0, 3).join('; ') });
		}
		// Kick cron so jobs start processing (uses industry mapping in processDemoJob for correct endpoint e.g. dental → /api/dental-async)
		const cronSecret = (env.CRON_SECRET ?? '').trim();
		if (origin && cronSecret && enqueued > 0) {
			fetch(`${origin.replace(/\/$/, '')}/api/cron/jobs/demo`, {
				method: 'GET',
				headers: { Authorization: `Bearer ${cronSecret}` }
			}).catch(() => {});
		}
		return {
			success: true,
			created: enqueued,
			enqueued,
			queued: enqueued,
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
			return fail(403, { message: 'Automated send is available on Starter, Growth, and Agency plans.' });
		}
		if (!(await getSendConfigured(user.id))) {
			return fail(503, { message: 'Email sending is not configured. Connect Gmail in Integrations.' });
		}
		const formData = await request.formData();
		if (formData.get('aupConfirmed') !== 'on') {
			return fail(400, { message: 'You must confirm compliance with the Acceptable Use Policy before sending.' });
		}
		const prospectIds = formData.getAll('prospectId');
		if (prospectIds.length === 0) {
			return fail(400, { message: 'Select at least one client to send.' });
		}
		serverInfo('sendDemos', 'Started', { prospectCount: prospectIds.length });
		const demoTracking = await getDemoTrackingForUser(user.id);
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
			const tracking = demoTracking[id];
			if (!tracking || tracking.status !== 'approved') continue;
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
	}
};
