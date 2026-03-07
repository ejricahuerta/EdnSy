import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/** Redirect legacy /dashboard/clients/[id] to /dashboard/prospects/[id] */
export const load: PageServerLoad = async ({ params }) => {
	throw redirect(303, `/dashboard/prospects/${params.id}`);
};
