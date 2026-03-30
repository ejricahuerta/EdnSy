import { fail, redirect } from '@sveltejs/kit';
import { getFreeDemosState, incrementFreeDemos } from '$lib/server/freeLimit';
import { setFreeDemoCookie } from '$lib/server/demo';
import { INDUSTRY_SLUGS, type IndustrySlug } from '$lib/industries';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const state = getFreeDemosState(cookies);
	return { freeLimit: state };
};

export const actions: Actions = {
	createDemo: async ({ request, cookies }) => {
		const state = getFreeDemosState(cookies);
		if (state.atLimit) {
			return fail(403, {
				message: `You've used your ${state.limit} free demos this month. Sign in for Starter, Growth, or Agency.`,
				atLimit: true
			});
		}
		const formData = await request.formData();
		const companyName = (formData.get('companyName') as string)?.trim() ?? '';
		const email = (formData.get('email') as string)?.trim() ?? '';
		const phone = (formData.get('phone') as string)?.trim() ?? '';
		const website = (formData.get('website') as string)?.trim() ?? '';
		const industry = (formData.get('industry') as string)?.trim() || 'dental';
		if (!companyName) {
			return fail(400, { message: 'Company name is required.' });
		}
		if (!email && !phone) {
			return fail(400, { message: 'Email or phone is required.' });
		}
		const validSlug = INDUSTRY_SLUGS.includes(industry as IndustrySlug) ? industry : 'dental';
		setFreeDemoCookie(cookies, { companyName, email, website, industry: validSlug });
		incrementFreeDemos(cookies);
		throw redirect(303, `/${validSlug}/demo`);
	}
};
