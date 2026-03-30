import type { LayoutServerLoad } from './$types';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';
import { getPlanForUser } from '$lib/server/stripe';
import { getProspectOwnerId } from '$lib/server/prospects';
import { getDemoBanner } from '$lib/server/userSettings';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const cookie = cookies.get(getSessionCookieName());
	const user = await getSessionFromCookie(cookie);
	const plan = user ? await getPlanForUser(user) : 'free';

	let demoBanner: { text: string; ctaLabel: string; ctaHref: string } | null = null;
	const pathname = url.pathname;
	if (pathname.startsWith('/demo/') && pathname !== '/demo') {
		const slug = pathname.replace(/^\/demo\/?/, '').split('/')[0]?.trim();
		if (slug) {
			const ownerId = await getProspectOwnerId(slug);
			if (ownerId) {
				demoBanner = await getDemoBanner(ownerId);
			}
		}
	}

	return {
		user: user ?? null,
		plan,
		siteOrigin: url.origin,
		demoBanner
	};
};
