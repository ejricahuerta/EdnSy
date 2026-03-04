import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/** Redirect legacy /dashboard/profile to /dashboard/settings/profile */
export const load: PageServerLoad = async () => {
	throw redirect(303, '/dashboard/settings/profile');
};
