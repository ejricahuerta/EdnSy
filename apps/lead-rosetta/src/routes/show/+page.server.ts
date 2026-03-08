/**
 * Show page: in-person client view. Look up by business name + address to pull GBP info,
 * AI website/SEO analysis, and recommendations. Option to generate a demo and send link.
 * Requires authentication.
 */

import { fail, redirect, isRedirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { Prospect } from '$lib/server/prospects';
import { getScrapedDataForDemo } from '$lib/server/gbp';
import { insertFreeDemoRequest } from '$lib/server/supabase';
import { getOriginForOutgoingLinks } from '$lib/server/send';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';
import { env } from '$env/dynamic/private';
import { INDUSTRY_SLUGS, type IndustrySlug } from '$lib/industries';
import type { GbpData } from '$lib/server/gbp';
import type { DemoAudit, GeminiInsight } from '$lib/types/demo';

/** Minimal prospect for show-page lookup (name + address only). */
function prospectForShowLookup(businessName: string, address: string): Prospect {
	return {
		id: 'show-lookup',
		companyName: businessName.trim() || 'Business',
		email: '',
		website: '',
		city: address.trim() || undefined,
		industry: 'Professional',
		status: ''
	};
}

export const load: PageServerLoad = async ({ cookies }) => {
	const user = await getSessionFromCookie(cookies.get(getSessionCookieName()));
	if (!user) {
		throw redirect(303, '/auth/login');
	}
	return { user };
};

export const actions: Actions = {
	lookup: async ({ request, cookies }) => {
		const user = await getSessionFromCookie(cookies.get(getSessionCookieName()));
		if (!user) throw redirect(303, '/auth/login');

		const formData = await request.formData();
		const businessName = (formData.get('businessName') as string)?.trim() ?? '';
		const address = (formData.get('address') as string)?.trim() ?? '';

		if (!businessName) {
			return fail(400, {
				lookupError: 'Business name is required.',
				lookupData: null
			});
		}

		const prospect = prospectForShowLookup(businessName, address);
		const scrapedResult = await getScrapedDataForDemo(prospect, {
			defaultLocation: address || undefined
		});

		if (!scrapedResult.ok) {
			const msg =
				scrapedResult.errors?.dataforseo ?? scrapedResult.errors?.gemini ?? 'Lookup failed. Try a more specific name and address.';
			return fail(502, {
				lookupError: msg,
				lookupData: null
			});
		}

		const data = scrapedResult.data as DemoAudit & { gbpRaw?: GbpData };
		const gbp = data.gbpRaw ?? null;
		const insight = data.insight ?? null;

		return {
			lookupError: null,
			lookupData: {
				businessName,
				address,
				gbp,
				insight,
				audit: {
					websiteStatus: data.websiteStatus,
					websiteStatusLevel: data.websiteStatusLevel,
					gbpCompletenessScore: data.gbpCompletenessScore,
					gbpCompletenessLabel: data.gbpCompletenessLabel,
					googleReviewCount: data.googleReviewCount,
					googleRatingValue: data.googleRatingValue,
					gbpClaimed: data.gbpClaimed,
					gbpHasHours: data.gbpHasHours
				}
			}
		};
	},

	createDemo: async ({ request, url, cookies }) => {
		const user = await getSessionFromCookie(cookies.get(getSessionCookieName()));
		if (!user) throw redirect(303, '/auth/login');

		try {
			const formData = await request.formData();
			const email = (formData.get('email') as string)?.trim() ?? '';
			const businessName = (formData.get('businessName') as string)?.trim() ?? '';
			const website = (formData.get('website') as string)?.trim() ?? '';
			const industry = (formData.get('industry') as string)?.trim() || 'professional';

			if (!email) {
				return fail(400, { createDemoError: 'Email is required to send the demo link.' });
			}
			if (!businessName) {
				return fail(400, { createDemoError: 'Business name is required. Run a lookup first.' });
			}

			const validSlug = INDUSTRY_SLUGS.includes(industry as IndustrySlug) ? industry : 'professional';
			const row = await insertFreeDemoRequest({
				email,
				companyName: businessName,
				website: website || undefined,
				industry: validSlug
			});

			if (!row) {
				return fail(503, {
					createDemoError: 'Demo request could not be created. Please try again.'
				});
			}

			// Kick cron so generation starts
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
			const msg = e instanceof Error ? e.message : String(e);
			return fail(500, { createDemoError: `Something went wrong: ${msg}` });
		}
	}
};
