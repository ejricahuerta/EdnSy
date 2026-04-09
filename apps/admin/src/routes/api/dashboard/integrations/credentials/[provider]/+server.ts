import type { RequestHandler } from './$types';
import { getDashboardSessionUser } from '$lib/server/authDashboard';
import { getCrmConnection } from '$lib/server/crm';
import { apiError, apiSuccess } from '$lib/server/apiResponse';
import { getApifyApiTokenForUser } from '$lib/server/apifyToken';

const ALLOWED = ['notion', 'apify'] as const;

export const GET: RequestHandler = async (event) => {
	const { cookies, params } = event;
	const user = await getDashboardSessionUser(event);
	if (!user) {
		return apiError(401, 'Sign in required');
	}
	const provider = params.provider?.toLowerCase();
	if (!provider || !ALLOWED.includes(provider as (typeof ALLOWED)[number])) {
		return apiError(400, 'Invalid provider');
	}
	if (provider === 'notion') {
		const conn = await getCrmConnection(user.id, 'notion');
		if (!conn) return apiError(404, 'Not connected');
		return apiSuccess({
			apiKey: conn.access_token,
			databaseId: conn.databaseId ?? ''
		});
	}
	if (provider === 'apify') {
		const apiKey = await getApifyApiTokenForUser(user.id);
		if (!apiKey) return apiError(404, 'Not connected');
		return apiSuccess({ apiKey });
	}
	return apiError(400, 'Invalid provider');
};
