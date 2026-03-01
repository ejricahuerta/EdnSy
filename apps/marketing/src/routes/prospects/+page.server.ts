import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/** Redirect legacy /prospects URL to /dashboard (Pro & Agency dashboard). */
export const load: PageServerLoad = async () => {
	throw redirect(302, '/dashboard');
};
