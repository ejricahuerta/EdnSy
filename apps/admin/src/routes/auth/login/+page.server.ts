import { resolveGoogleOAuthRedirectUri } from '$lib/server/googleDashboardAuth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const err = url.searchParams.get('error');
	const authError =
		err === 'auth' || err === 'oauth' || err === 'session'
			? (err as 'auth' | 'oauth' | 'session')
			: null;
	return {
		authError,
		googleOAuthRedirectUri: resolveGoogleOAuthRedirectUri(url.origin)
	};
};
