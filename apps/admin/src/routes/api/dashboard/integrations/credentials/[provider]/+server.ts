import type { RequestHandler } from './$types';
import { getDashboardSessionUser } from '$lib/server/authDashboard';
import { getCrmConnection } from '$lib/server/crm';
import { apiError, apiSuccess } from '$lib/server/apiResponse';

const ALLOWED = ['notion'] as const;

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
	const conn = await getCrmConnection(user.id, provider as (typeof ALLOWED)[number]);
	if (!conn) {
		return apiError(404, 'Not connected');
	}
	if (provider === 'notion') {
		return apiSuccess({
			apiKey: conn.access_token,
			databaseId: conn.databaseId ?? ''
		});
	}
	return apiSuccess({ apiKey: conn.access_token });
};
