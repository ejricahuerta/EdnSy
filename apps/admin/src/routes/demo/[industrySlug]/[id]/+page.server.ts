/**
 * Redirect legacy demo URLs /demo/[industrySlug]/[id] → /demo/[id].
 * Theme is now determined by industry from prospect data; no industry in URL.
 */

import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = params.id;
	if (!id) throw redirect(302, '/auth/login');
	throw redirect(302, `/demo/${id}`);
};
