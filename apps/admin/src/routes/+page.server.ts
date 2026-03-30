import { redirect } from '@sveltejs/kit';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';
import type { PageServerLoad } from './$types';

/** Root has no public landing: send everyone to login or dashboard. */
export const load: PageServerLoad = async ({ cookies }) => {
	const cookie = cookies.get(getSessionCookieName());
	const user = await getSessionFromCookie(cookie);
	if (user) {
		throw redirect(303, '/dashboard');
	}
	throw redirect(303, '/auth/login');
};
