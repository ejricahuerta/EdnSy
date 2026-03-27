import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getFreeDemosState, incrementFreeDemos } from '$lib/server/freeLimit';
import { getActiveFreeDemoRequestByEmailAndCompany, insertFreeDemoRequest, setFreeDemoEmailSentAt } from '$lib/server/supabase';
import { getOriginForOutgoingLinks, sendEmail, escapeHtml } from '$lib/server/send';
import { LEGAL_COMPANY_NAME, LEGAL_COMPANY_ADDRESS } from '$lib/constants';
import { INDUSTRY_SLUGS, type IndustrySlug } from '$lib/industries';
import type { PageServerLoad, Actions } from './$types';
import { serverError } from '$lib/server/logger';

/** Set to true to disable free demo limit for testing. */
const FREE_DEMO_LIMIT_DISABLED = true;
/** Set to true to allow multiple demos for same business (skip "already being created" check). */
const FREE_DEMO_DUPLICATE_CHECK_DISABLED = true;

export const load: PageServerLoad = async ({ cookies }) => {
	const state = getFreeDemosState(cookies);
	return { freeLimit: state };
};

export const actions: Actions = {
	createDemo: async ({ request, cookies, url }) => {
		try {
			if (!FREE_DEMO_LIMIT_DISABLED) {
				const state = getFreeDemosState(cookies);
				if (state.atLimit) {
					return fail(403, {
						message: `You've used your ${state.limit} free demos this month. Sign in for Starter, Growth, or Agency.`,
						atLimit: true
					});
				}
			}

			const formData = await request.formData();
			const companyName = (formData.get('companyName') as string)?.trim() ?? '';
			const email = (formData.get('email') as string)?.trim() ?? '';
			const website = (formData.get('website') as string)?.trim() ?? '';
			const industry = (formData.get('industry') as string)?.trim() || 'dental';
			const complianceConfirm = formData.get('complianceConfirm') === 'on';

			if (!complianceConfirm) {
				return fail(400, { message: 'Please confirm you are responsible for compliance with applicable laws in your jurisdiction.' });
			}

			if (!companyName && !email) {
				return fail(400, { message: 'Enter at least a company name or email.' });
			}

			if (!email) {
				return fail(400, { message: 'Email is required so we can send you the demo link.' });
			}

			if (!FREE_DEMO_DUPLICATE_CHECK_DISABLED) {
				const active = await getActiveFreeDemoRequestByEmailAndCompany(email, companyName || email);
				if (active) {
					return fail(409, {
						message: 'A demo is already being created for this business. Check your email for the link.',
						alreadyCreating: true
					});
				}
			}

			const validSlug = INDUSTRY_SLUGS.includes(industry as IndustrySlug) ? industry : 'dental';
			const row = await insertFreeDemoRequest({
				email,
				companyName: companyName || 'Your business',
				website: website || undefined,
				industry: validSlug
			});
			if (!row) {
				return fail(503, {
					message: 'Demo signup is unavailable. Make sure Supabase is configured and the free_demo_requests table exists (run migrations).'
				});
			}

			if (!FREE_DEMO_LIMIT_DISABLED) {
				incrementFreeDemos(cookies);
			}

			const company = companyName || 'your business';
			const subject = `Thanks for trying — we're creating your demo`;
			const safeCompany = escapeHtml(company);
			const html = `
<p>Hi,</p>
<p>Thank you for trying Lead Rosetta.</p>
<p>We're creating your free demo for ${safeCompany}. It usually takes 1–2 minutes.</p>
<p>We'll send you another email with the demo link as soon as it's ready.</p>
<p>— Lead Rosetta</p>
<hr style="margin-top:1.5em; border:none; border-top:1px solid #eee;" />
<p style="font-size:0.85em; color:#666;">${LEGAL_COMPANY_NAME} | ${LEGAL_COMPANY_ADDRESS}</p>
`.trim();
			const sendResult = await sendEmail(email, subject, html);
			if (sendResult.ok) {
				await setFreeDemoEmailSentAt(row.id);
			}

			// Kick cron so processing can start immediately (fire-and-forget)
			const origin = getOriginForOutgoingLinks(url.origin);
			const cronSecret = (env.CRON_SECRET ?? '').trim();
			if (origin && cronSecret) {
				fetch(`${origin}/api/cron/jobs/demo`, {
					method: 'GET',
					headers: { Authorization: `Bearer ${cronSecret}` }
				}).catch(() => {});
			}

			throw redirect(303, `/demo/${row.id}`);
		} catch (e) {
			if (isRedirect(e)) throw e;
			const msg =
				e instanceof Error
					? e.message
					: typeof (e as { message?: string }).message === 'string'
						? (e as { message: string }).message
						: JSON.stringify(e);
			serverError('try/createDemo', 'createDemo failed', { error: e });
			return fail(500, { message: `Something went wrong: ${msg}` });
		}
	}
};
