import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const err = url.searchParams.get('error');
	const authError =
		err === 'auth' || err === 'oauth' || err === 'session' || err === 'forbidden'
			? (err as 'auth' | 'oauth' | 'session' | 'forbidden')
			: null;
	return { authError };
};
