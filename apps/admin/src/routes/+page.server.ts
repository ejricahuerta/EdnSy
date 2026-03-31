import { redirect } from '@sveltejs/kit';
import { getDashboardSessionUser } from '$lib/server/authDashboard';
import type { PageServerLoad } from './$types';

/** Root has no public landing: send everyone to login or dashboard. */
export const load: PageServerLoad = async (event) => {
	const user = await getDashboardSessionUser(event);
	if (user) {
		throw redirect(303, '/dashboard');
	}
	throw redirect(303, '/auth/login');
};
