import type { RequestEvent } from '@sveltejs/kit';
import type { SessionUser } from '$lib/server/session';
import { getSessionCookieName, getSessionFromCookie } from '$lib/server/session';

/**
 * Dashboard user from the signed app session (Google `sub` as `id`).
 * Supabase Auth is only used to sync JWT for Realtime; identity comes from this cookie.
 */
export async function getDashboardSessionUser(event: RequestEvent): Promise<SessionUser | null> {
	return getSessionFromCookie(event.cookies.get(getSessionCookieName()));
}
