import type { RequestHandler } from './$types';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';
import { getSubscriptionForUser, createPortalSession } from '$lib/server/stripe';
import { apiError, apiSuccess } from '$lib/server/apiResponse';

export const POST: RequestHandler = async ({ request, cookies, url }) => {
	const cookie = cookies.get(getSessionCookieName());
	const user = await getSessionFromCookie(cookie);
	if (!user) {
		return apiError(401, 'Sign in required');
	}
	const body = (await request.json().catch(() => ({}))) as { returnUrl?: string };
	const returnUrl = body.returnUrl ?? `${url.origin}/dashboard/billing`;
	const sub = await getSubscriptionForUser(user.id);
	if (!sub?.stripe_customer_id) {
		return apiError(400, 'No subscription to manage');
	}
	const result = await createPortalSession(sub.stripe_customer_id, returnUrl);
	if ('error' in result) {
		return apiError(502, result.error);
	}
	return apiSuccess({ url: result.url });
};
