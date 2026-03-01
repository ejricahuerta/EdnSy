import { fail, redirect } from '@sveltejs/kit';
import { getFreeBriefingsState, incrementFreeBriefings } from '$lib/server/freeLimit';
import { setFreeDemoCookie } from '$lib/server/freeDemo';
import { INDUSTRY_SLUGS, type IndustrySlug } from '$lib/industries';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const state = getFreeBriefingsState(cookies);
	return { freeLimit: state };
};

export const actions: Actions = {
	createDemo: async ({ request, cookies }) => {
		const state = getFreeBriefingsState(cookies);
		if (state.atLimit) {
			return fail(403, {
				message: `You've used your ${state.limit} free demos this month. Sign in for Starter (30 demos/month) or Pro (100 demos/month).`,
				atLimit: true
			});
		}

		const formData = await request.formData();
		const companyName = (formData.get('companyName') as string)?.trim() ?? '';
		const email = (formData.get('email') as string)?.trim() ?? '';
		const website = (formData.get('website') as string)?.trim() ?? '';
		const industry = (formData.get('industry') as string)?.trim() || 'solo-professionals';
		const complianceConfirm = formData.get('complianceConfirm') === 'on';

		if (!complianceConfirm) {
			return fail(400, { message: 'Please confirm you are responsible for compliance with applicable laws in your jurisdiction.' });
		}

		if (!companyName && !email) {
			return fail(400, { message: 'Enter at least a company name or email.' });
		}

		const validSlug = INDUSTRY_SLUGS.includes(industry as IndustrySlug) ? industry : 'solo-professionals';
		setFreeDemoCookie(cookies, { companyName, email, website, industry: validSlug });
		incrementFreeBriefings(cookies);

		throw redirect(303, `/${validSlug}/demo`);
	}
};
