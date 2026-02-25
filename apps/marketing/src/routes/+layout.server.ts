import type { LayoutServerLoad } from './$types';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const cookie = cookies.get(getSessionCookieName());
	const user = await getSessionFromCookie(cookie);
	return { user: user ?? null };
};
