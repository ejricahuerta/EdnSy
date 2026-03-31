import type { LayoutServerLoad } from './$types';
import { getDashboardSessionUser } from '$lib/server/authDashboard';
import { getPlanForUser } from '$lib/server/stripe';
import { getProspectOwnerId } from '$lib/server/prospects';
import { getDemoBanner } from '$lib/server/userSettings';
import { getSupabasePublicConfig } from '$lib/server/supabasePublicConfig';

export const load: LayoutServerLoad = async (event) => {
	const { url } = event;
	const user = await getDashboardSessionUser(event);
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

	const supabasePublic = getSupabasePublicConfig();

	return {
		user: user ?? null,
		plan,
		siteOrigin: url.origin,
		demoBanner,
		supabasePublic
	};
};
