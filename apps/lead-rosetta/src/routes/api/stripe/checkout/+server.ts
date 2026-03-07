import type { RequestHandler } from './$types';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';
import { createCheckoutSession, getStripeConfig } from '$lib/server/stripe';
import { apiError, apiSuccess } from '$lib/server/apiResponse';

export const POST: RequestHandler = async ({ request, cookies, url }) => {
	const cookie = cookies.get(getSessionCookieName());
	const user = await getSessionFromCookie(cookie);
	if (!user) {
		return apiError(401, 'Sign in required');
	}
	const body = await request.json().catch(() => ({})) as { priceId?: string };
	const priceId = body.priceId;
	if (!priceId || typeof priceId !== 'string') {
		return apiError(400, 'priceId required');
	}
	const { priceStarter, pricePro } = getStripeConfig();
	if (priceId !== priceStarter && priceId !== pricePro) {
		return apiError(400, 'Invalid price');
	}
	const origin = url.origin;
	const result = await createCheckoutSession(
		user.id,
		user.email,
		priceId,
		`${origin}/dashboard?checkout=success`,
		`${origin}/dashboard/billing?checkout=canceled`
	);
	if ('error' in result) {
		return apiError(502, result.error);
	}
	return apiSuccess({ url: result.url });
};
