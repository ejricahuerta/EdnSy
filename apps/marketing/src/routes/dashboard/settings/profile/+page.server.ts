import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';

export const load: PageServerLoad = async ({ cookies }) => {
	const cookie = cookies.get(getSessionCookieName());
	const user = await getSessionFromCookie(cookie);
	if (!user) {
		throw redirect(303, '/auth/login');
	}
	return { user };
};
