import { fail, redirect } from '@sveltejs/kit';
import {
	listProspects,
	getProspectById,
	updateProspectDemoLink,
	updateProspectFromGbp
} from '$lib/server/prospects';
import {
	getSupabaseAdmin,
	getDemoTrackingForUser,
	getDemoCountThisMonth,
	updateDemoTrackingStatus,
	upsertDemoTrackingForProspect,
	getDashboardOverview
} from '$lib/server/supabase';
import { getScrapedDataForDemo, formatScrapedDataErrorMessage } from '$lib/server/gbp';
import type { PageServerLoad, Actions } from './$types';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';
import { getCrmIndustryFilter, getGbpDefaultLocation, getEffectiveEmailSenderName, getEmailSignatureOverride } from '$lib/server/userSettings';
import { industryDisplayToSlug } from '$lib/industries';
import { isValidDemoTrackingStatus } from '$lib/demo';
import { getPlanForUser, getUpcomingInvoiceForUser } from '$lib/server/stripe';
import { listCrmConnections } from '$lib/server/crm';
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
	const sendConfigured = await getSendConfigured(user.id);
	const overview = await getDashboardOverview(user.id);
	const crmConnections = await listCrmConnections(user.id);
	const connectedApps: string[] = [];
	const providerLabels: Record<string, string> = {
		notion: 'Notion',
		hubspot: 'HubSpot',
		gohighlevel: 'GoHighLevel',
		pipedrive: 'Pipedrive'
	};
	for (const c of crmConnections) {
		if (c.connected && providerLabels[c.provider]) connectedApps.push(providerLabels[c.provider]);
	}
	const upcomingBill = await getUpcomingInvoiceForUser(user.id);

	// Bucket clients for dashboard: new (no demo), stagnant (sent, no engagement), ongoing (in progress)
	const LIMIT = 5;
	const newStatuses = new Set(['draft', 'approved', 'opened', 'clicked', 'replied']);
	const clientsNew = prospects.filter((p) => !(p.demoLink ?? '').trim()).slice(0, LIMIT);
	const clientsStagnant = prospects
		.filter((p) => {
			const t = demoTrackingByProspectId[p.id];
			return t?.status === 'sent';
		})
		.slice(0, LIMIT);
	const clientsOngoing = prospects
		.filter((p) => {
			const t = demoTrackingByProspectId[p.id];
			return t && newStatuses.has(t.status);
		})
		.slice(0, LIMIT);

	return {
		prospects,
		prospectsCount: prospects.length,
		clientsNew,
		clientsStagnant,
		clientsOngoing,
		prospectsError: 'error' in result ? result.error : undefined,
		prospectsMessage: 'message' in result ? result.message : undefined,
		user,
		plan,
		demoLimit,
		demoCountThisMonth,
		demoTrackingByProspectId,
		sendConfigured,
		overviewWhat: overview?.what ?? null,
		overviewKeyFindings: overview?.key_findings ?? null,
		overviewNext: overview?.next ?? null,
		overviewStagnation: overview?.stagnation ?? null,
		overviewGeneratedAt: overview?.generated_at ?? null,
		connectedApps,
		upcomingBill
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
		const result = await updateProspectDemoLink(prospectId, demoUrl, 'Demo Created');
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
		const origin = getOriginForOutgoingLinks(url.origin);
		const defaultLocation = await getGbpDefaultLocation(user.id);
		let created = 0;
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
			const scrapedData = scrapedResult.data;
			const demoUrl = `${origin}/demo/${prospectId}`;
			const updateResult = await updateProspectDemoLink(prospectId, demoUrl, 'Demo Created');
			if (!updateResult.ok) {
				errors.push(`${prospect.companyName || prospectId}: ${updateResult.error ?? 'Failed'}`);
				continue;
			}
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
			created++;
			countThisMonth++;
		}
		if (created === 0 && errors.length > 0) {
			return fail(502, { message: errors.slice(0, 3).join('; ') });
		}
		return {
			success: true,
			created,
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
