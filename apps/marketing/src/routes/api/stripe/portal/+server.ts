import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';
import { getSubscriptionForUser, createPortalSession } from '$lib/server/stripe';

export const POST: RequestHandler = async ({ request, cookies, url }) => {
	const cookie = cookies.get(getSessionCookieName());
	const user = await getSessionFromCookie(cookie);
	if (!user) {
		return json({ error: 'Sign in required' }, { status: 401 });
	}
	const body = (await request.json().catch(() => ({}))) as { returnUrl?: string };
	const returnUrl = body.returnUrl ?? `${url.origin}/dashboard/billing`;
	const sub = await getSubscriptionForUser(user.id);
	if (!sub?.stripe_customer_id) {
		return json({ error: 'No subscription to manage' }, { status: 400 });
	}
	const result = await createPortalSession(sub.stripe_customer_id, returnUrl);
	if ('error' in result) {
		return json({ error: result.error }, { status: 502 });
	}
	return json({ url: result.url });
};
