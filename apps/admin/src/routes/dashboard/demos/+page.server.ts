import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDashboardSessionUser } from '$lib/server/authDashboard';
import { listProspects } from '$lib/server/prospects';

/** Demos page: prospects that have a demo; show business name, link, and details. */
export const load: PageServerLoad = async (event) => {
	const user = await getDashboardSessionUser(event);
	if (!user) {
		throw redirect(303, '/auth/login');
	}
	const result = await listProspects(user.id);
	const prospects = (result.prospects ?? []).filter(
		(p) => !p.flagged && (p.demoLink ?? '').trim().length > 0
	);
	return { prospects };
};
