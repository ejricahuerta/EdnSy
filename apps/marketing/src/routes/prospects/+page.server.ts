import { fail, redirect } from '@sveltejs/kit';
import { listProspects, getProspectById, updateProspectDemoLink } from '$lib/server/notion';
import { scrapeBusinessData } from '$lib/server/scraper';
import { generateWebsiteData } from '$lib/server/gemini';
import { setBusinessData, setWebsiteData } from '$lib/server/demoData';
import type { PageServerLoad, Actions } from './$types';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';
import { industryDisplayToSlug } from '$lib/industries';

export const load: PageServerLoad = async ({ cookies }) => {
	const cookie = cookies.get(getSessionCookieName());
	const user = await getSessionFromCookie(cookie);
	if (!user) {
		throw redirect(303, '/auth/login');
	}
	const result = await listProspects();
	return {
		prospects: result.prospects,
		notionError: result.error,
		notionMessage: result.message,
		user
	};
};

export const actions: Actions = {
	generateDemo: async ({ request, url, cookies }) => {
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
		if (prospect.demoLink) {
			return fail(400, { message: 'Demo already created' });
		}

		// 1. Scrape website and/or Yellow Pages → Business Data
		let businessData;
		try {
			businessData = await scrapeBusinessData(prospect);
			await setBusinessData(prospectId, businessData);
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Scraping failed';
			return fail(502, { message: `Could not scrape business data: ${msg}` });
		}

		// 2. Generate Website Data from Business Data using Gemini
		let websiteData;
		try {
			websiteData = await generateWebsiteData(businessData, prospect.industry);
			await setWebsiteData(prospectId, websiteData);
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Gemini failed';
			return fail(502, { message: `Could not generate landing content: ${msg}. Ensure GEMINI_API_KEY is set.` });
		}

		// 3. Create demo URL and update Notion
		const slug = industryDisplayToSlug(prospect.industry);
		const origin = url.origin;
		const demoUrl = `${origin}/${slug}/${prospectId}`;
		const result = await updateProspectDemoLink(prospectId, demoUrl);
		if (!result.ok) {
			return fail(502, { message: result.error ?? 'Failed to update Notion' });
		}
		return { success: true, prospectId, demoLink: demoUrl };
	}
};
