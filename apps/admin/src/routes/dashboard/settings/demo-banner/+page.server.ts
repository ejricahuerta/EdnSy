import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';
import { getDemoBanner, setDemoBanner } from '$lib/server/userSettings';

export const load: PageServerLoad = async ({ cookies }) => {
	const cookie = cookies.get(getSessionCookieName());
	const user = await getSessionFromCookie(cookie);
	if (!user) {
		throw redirect(303, '/auth/login');
	}
	const banner = await getDemoBanner(user.id);
	return {
		demoBannerText: banner.text,
		demoBannerCtaLabel: banner.ctaLabel,
		demoBannerCtaHref: banner.ctaHref
	};
};

function getStr(formData: FormData, key: string): string {
	return (formData.get(key) ?? '').toString().trim();
}

export const actions: Actions = {
	saveDemoBanner: async ({ request, cookies }) => {
		const cookie = cookies.get(getSessionCookieName());
		const user = await getSessionFromCookie(cookie);
		if (!user) {
			return fail(401, { message: 'Sign in required' });
		}
		const formData = await request.formData();
		const text = getStr(formData, 'bannerText');
		const ctaLabel = getStr(formData, 'ctaLabel');
		const ctaHref = getStr(formData, 'ctaHref');
		const result = await setDemoBanner(user.id, { text, ctaLabel, ctaHref });
		if (!result.ok) {
			return fail(500, { message: result.error ?? 'Failed to save' });
		}
		return { success: true };
	}
};
