import { fail, redirect } from '@sveltejs/kit';
import { listProspects, getProspectById, updateProspectDemoLink } from '$lib/server/notion';
import type { PageServerLoad, Actions } from './$types';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';
import { industryDisplayToSlug } from '$lib/industries';

export const load: PageServerLoad = async ({ cookies }) => {
	const cookie = cookies.get(getSessionCookieName());
	const user = await getSessionFromCookie(cookie);
	if (!user) {
		throw redirect(303, '/auth/login');
	}
	const prospects = await listProspects();
	return { prospects, user };
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
