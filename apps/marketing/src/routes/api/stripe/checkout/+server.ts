import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';
import { createCheckoutSession, getStripeConfig } from '$lib/server/stripe';

export const POST: RequestHandler = async ({ request, cookies, url }) => {
	const cookie = cookies.get(getSessionCookieName());
	const user = await getSessionFromCookie(cookie);
	if (!user) {
		return json({ error: 'Sign in required' }, { status: 401 });
	}
	const body = await request.json().catch(() => ({})) as { priceId?: string };
	const priceId = body.priceId;
	if (!priceId || typeof priceId !== 'string') {
		return json({ error: 'priceId required' }, { status: 400 });
	}
	const { priceStarter, pricePro } = getStripeConfig();
	if (priceId !== priceStarter && priceId !== pricePro) {
		return json({ error: 'Invalid price' }, { status: 400 });
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
		return json({ error: result.error }, { status: 502 });
	}
	return json({ url: result.url });
};
