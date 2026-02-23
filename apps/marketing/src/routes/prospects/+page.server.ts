import { listProspects } from '$lib/server/notion';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const prospects = await listProspects();
	return { prospects };
};
