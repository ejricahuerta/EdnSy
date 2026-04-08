import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDashboardSessionUser } from '$lib/server/authDashboard';
import { listDemosProspects } from '$lib/server/prospects';
import { getDemoJobsMapGlobal } from '$lib/server/supabase';

/** Demos page: approved demos only; show business name, link, regenerate, and details. */
export const load: PageServerLoad = async (event) => {
	const user = await getDashboardSessionUser(event);
	if (!user) {
		throw redirect(303, '/auth/login');
	}
	const [result, demoJobsByProspectId] = await Promise.all([
		listDemosProspects(),
		getDemoJobsMapGlobal()
	]);
	if ('error' in result && result.error) {
		return {
			prospects: [],
			demoJobsByProspectId: {},
			demosLoadError: result.error,
			demosLoadMessage: result.message
		};
	}
	return { prospects: result.prospects ?? [], demoJobsByProspectId };
};
