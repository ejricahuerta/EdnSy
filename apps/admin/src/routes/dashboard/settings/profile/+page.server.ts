import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDashboardSessionUser } from '$lib/server/authDashboard';

export const load: PageServerLoad = async (event) => {
	const user = await getDashboardSessionUser(event);
	if (!user) {
		throw redirect(303, '/auth/login');
	}
	return { user };
};
