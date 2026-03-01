import { fail, redirect } from '@sveltejs/kit';
import { listProspects, getProspectById, updateProspectDemoLink, insertManualProspect } from '$lib/server/prospects';
import {
	getSupabaseAdmin,
	getDemoTrackingForUser,
	getDemoCountThisMonth,
	updateDemoTrackingStatus,
	upsertDemoTrackingForProspect
} from '$lib/server/supabase';
import { generateAuditForProspect } from '$lib/server/generateAudit';
import type { PageServerLoad, Actions } from './$types';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';
import { industryDisplayToSlug } from '$lib/industries';
import { getPlanForUser } from '$lib/server/stripe';
import { getDemoCreationLimit, canSendAutomated } from '$lib/plans';
import {
	sendEmail,
	sendSms,
	getDefaultEmailSubject,
	buildEmailBodyForUser,
	buildEmailBodyFromAiIntro,
	buildSmsBody,
	isResendConfigured,
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
	const demoTrackingByProspectId = await getDemoTrackingForUser(user.id);
	const sendConfigured = isResendConfigured();
	return {
		prospects: result.prospects,
		prospectsError: 'error' in result ? result.error : undefined,
		prospectsMessage: 'message' in result ? result.message : undefined,
		user,
		plan,
		demoLimit,
		demoCountThisMonth,
		demoTrackingByProspectId,
		sendConfigured
	};
};

export const actions: Actions = {
	addTestProspect: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) return fail(401, { message: 'Sign in required' });
		const formData = await request.formData();
		const companyName = (formData.get('companyName') as string)?.trim() ?? '';
		const email = (formData.get('email') as string)?.trim() ?? '';
		const industry = (formData.get('industry') as string)?.trim() || 'Solo professionals';
		if (!companyName) return fail(400, { message: 'Company name is required.' });
		if (!email) return fail(400, { message: 'Email is required to send a demo.' });
		const { id, error } = await insertManualProspect(user.id, { companyName, email, industry });
		if (error) return fail(502, { message: error });
		return { success: true, prospectId: id, message: 'Test client added. Create a demo, then approve and send.' };
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
		if (prospect.demoLink) {
			return fail(400, { message: 'Demo already created' });
		}
		const slug = industryDisplayToSlug(prospect.industry);
		const origin = url.origin;
		const demoUrl = `${origin}/${slug}/${prospectId}`;
		const result = await updateProspectDemoLink(prospectId, demoUrl, 'Demo Created');
		if (!result.ok) {
			return fail(502, { message: result.error ?? 'Failed to update prospect' });
		}
		const supabase = getSupabaseAdmin();
		if (supabase && prospect.provider && prospect.provider_row_id) {
			await upsertDemoTrackingForProspect(
				user.id,
				prospectId,
				prospect.provider,
				prospect.provider_row_id,
				demoUrl,
				'draft'
			);
		}
		const audit = await generateAuditForProspect(prospect);
		if (audit && supabase) {
			await updateDemoTrackingStatus(user.id, prospectId, {
				status: 'draft',
				scrapedData: audit
			});
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
		const validStatuses = ['draft', 'approved', 'sent', 'opened', 'clicked', 'replied'];
		if (!status || typeof status !== 'string' || !validStatuses.includes(status)) {
			return fail(400, { message: 'Invalid status' });
		}
		const result = await updateDemoTrackingStatus(user.id, prospectId, {
			status: status as 'draft' | 'approved' | 'sent' | 'opened' | 'clicked' | 'replied'
		});
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
		const origin = url.origin;
		let created = 0;
		const errors: string[] = [];
		for (const prospectId of prospectIds) {
			if (demoLimit !== null && countThisMonth >= demoLimit) break;
			const prospect = await getProspectById(prospectId);
			if (!prospect) continue;
			if (prospect.demoLink) continue;
			const slug = industryDisplayToSlug(prospect.industry);
			const demoUrl = `${origin}/${slug}/${prospectId}`;
			const result = await updateProspectDemoLink(prospectId, demoUrl, 'Demo Created');
			if (!result.ok) {
				errors.push(`${prospect.companyName || prospectId}: ${result.error ?? 'Failed'}`);
				continue;
			}
			if (supabase && prospect.provider && prospect.provider_row_id) {
				await upsertDemoTrackingForProspect(
					user.id,
					prospectId,
					prospect.provider,
					prospect.provider_row_id,
					demoUrl,
					'draft'
				);
			}
			const audit = await generateAuditForProspect(prospect);
			if (audit && supabase) {
				await updateDemoTrackingStatus(user.id, prospectId, {
					status: 'draft',
					scrapedData: audit
				});
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
		if (!isResendConfigured()) {
			return fail(503, { message: 'Email sending is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.' });
		}
		const formData = await request.formData();
		if (formData.get('aupConfirmed') !== 'on') {
			return fail(400, { message: 'You must confirm compliance with the Acceptable Use Policy before sending.' });
		}
		const prospectIds = formData.getAll('prospectId');
		if (prospectIds.length === 0) {
			return fail(400, { message: 'Select at least one client to send.' });
		}
		const demoTracking = await getDemoTrackingForUser(user.id);
		const templates = await getTemplates(user.id);
		const senderName = user.email?.split('@')[0] || 'Lead Rosetta';
		const supabase = getSupabaseAdmin();
		let sent = 0;
		const errors: string[] = [];
		for (const id of prospectIds) {
			if (typeof id !== 'string') continue;
			const tracking = demoTracking[id];
			if (!tracking || tracking.status !== 'approved') continue;
			const prospect = await getProspectById(id);
			if (!prospect?.demoLink) continue;
			const demoLink = prospect.demoLink;
			let anySent = false;
			if (prospect.email?.trim()) {
				const aiCopy = await generateEmailCopy(prospect, senderName);
				const subject = aiCopy?.subject ?? getDefaultEmailSubject(prospect.companyName || 'your business');
				const html = aiCopy
					? buildEmailBodyFromAiIntro(prospect, demoLink, senderName, url.origin, aiCopy.bodyIntro)
					: buildEmailBodyForUser(
							prospect,
							demoLink,
							senderName,
							url.origin,
							templates.emailHtml
						);
				const result = await sendEmail(prospect.email.trim(), subject, html);
				if (result.ok) {
					sent++;
					anySent = true;
				} else {
					errors.push(`${prospect.companyName || id}: ${result.error}`);
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
			return fail(502, { message: errors.slice(0, 3).join('; ') });
		}
		return {
			success: true,
			sent,
			total: prospectIds.length,
			errors: errors.length > 0 ? errors.slice(0, 5) : undefined
		};
	}
};
