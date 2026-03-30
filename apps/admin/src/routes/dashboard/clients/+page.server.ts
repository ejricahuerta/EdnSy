import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/** Redirect legacy /dashboard/clients to /dashboard/prospects */
export const load: PageServerLoad = async () => {
	throw redirect(303, '/dashboard/prospects');
};
