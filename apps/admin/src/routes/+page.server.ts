import { redirect } from '@sveltejs/kit';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';
import type { PageServerLoad } from './$types';

/** Redirect logged-in users from home (/) to /dashboard. */
export const load: PageServerLoad = async ({ cookies }) => {
	const cookie = cookies.get(getSessionCookieName());
	const user = await getSessionFromCookie(cookie);
	if (user) {
		throw redirect(303, '/dashboard');
	}
	return {};
};
