import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDashboardSessionUser } from '$lib/server/authDashboard';
import { listDemosProspects } from '$lib/server/prospects';

/** Demos page: prospects that have a demo; show business name, link, and details. */
export const load: PageServerLoad = async (event) => {
	const user = await getDashboardSessionUser(event);
	if (!user) {
		throw redirect(303, '/auth/login');
	}
	const result = await listDemosProspects();
	if ('error' in result && result.error) {
		return {
			prospects: [],
			demosLoadError: result.error,
			demosLoadMessage: result.message
		};
	}
	return { prospects: result.prospects ?? [] };
};
