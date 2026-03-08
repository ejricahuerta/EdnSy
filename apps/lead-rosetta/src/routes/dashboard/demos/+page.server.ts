import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';
import { listProspects } from '$lib/server/prospects';

/** Demos page: prospects that have a demo; show business name, link, and details. */
export const load: PageServerLoad = async ({ cookies }) => {
	const cookie = cookies.get(getSessionCookieName());
	const user = await getSessionFromCookie(cookie);
	if (!user) {
		throw redirect(303, '/auth/login');
	}
	const result = await listProspects(user.id);
	const prospects = (result.prospects ?? []).filter(
		(p) => !p.flagged && (p.demoLink ?? '').trim().length > 0
	);
	return { prospects };
};
