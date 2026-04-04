import type { RequestEvent } from '@sveltejs/kit';
import type { SessionUser } from '$lib/server/session';
import { getSessionCookieName, getSessionFromCookie } from '$lib/server/session';
import { isEdnsyUser } from '$lib/plans';

/**
 * Dashboard user from the signed app session (Google `sub` as `id`).
 * Supabase Auth is only used to sync JWT for Realtime; identity comes from this cookie.
 * Only @ednsy.com accounts are treated as signed in for this app.
 */
export async function getDashboardSessionUser(event: RequestEvent): Promise<SessionUser | null> {
	const user = await getSessionFromCookie(event.cookies.get(getSessionCookieName()));
	if (!user || !isEdnsyUser(user)) return null;
	return user;
}
