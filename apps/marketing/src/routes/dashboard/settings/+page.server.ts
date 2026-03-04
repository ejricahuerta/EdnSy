import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';
import { getCrmIndustryFilter, setCrmIndustryFilter, getGbpDefaultLocation, setGbpDefaultLocation } from '$lib/server/userSettings';
import { INDUSTRY_SLUGS, INDUSTRY_LABELS, type IndustrySlug } from '$lib/industries';

export const load: PageServerLoad = async ({ cookies }) => {
	const cookie = cookies.get(getSessionCookieName());
	const user = await getSessionFromCookie(cookie);
	if (!user) {
		throw redirect(303, '/auth/login');
	}
	const [crmIndustryFilter, gbpDefaultLocation] = await Promise.all([
		getCrmIndustryFilter(user.id),
		getGbpDefaultLocation(user.id)
	]);
	return {
		crmIndustryFilter,
		gbpDefaultLocation: gbpDefaultLocation ?? '',
		industries: INDUSTRY_SLUGS.map((slug) => ({
			slug,
			label: INDUSTRY_LABELS[slug]
		}))
	};
};

export const actions: Actions = {
	saveCrmIndustryFilter: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) {
			return fail(401, { message: 'Sign in required' });
		}
		const formData = await request.formData();
		const selected = formData.getAll('industry').filter((v): v is string => typeof v === 'string');
		const slugs = selected.filter((s) => INDUSTRY_SLUGS.includes(s as IndustrySlug)) as IndustrySlug[];
		const result = await setCrmIndustryFilter(user.id, slugs);
		if (!result.ok) {
			return fail(500, { message: result.error ?? 'Failed to save' });
		}
		return { success: true };
	},
	saveGbpDefaultLocation: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) {
			return fail(401, { message: 'Sign in required' });
		}
		const formData = await request.formData();
		const location = (formData.get('location') ?? '').toString().trim();
		const result = await setGbpDefaultLocation(user.id, location);
		if (!result.ok) {
			return fail(500, { message: result.error ?? 'Failed to save' });
		}
		return { success: true };
	}
};
