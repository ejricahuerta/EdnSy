import type { LayoutServerLoad } from './$types';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';
import { getPlanForUser } from '$lib/server/stripe';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const cookie = cookies.get(getSessionCookieName());
	const user = await getSessionFromCookie(cookie);
	const plan = user ? await getPlanForUser(user) : 'free';
	return {
		user: user ?? null,
		plan,
		siteOrigin: url.origin
	};
};
