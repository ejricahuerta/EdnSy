import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';
import { getSubscriptionForUser, getStripeConfig } from '$lib/server/stripe';

export const load: PageServerLoad = async ({ cookies }) => {
	const cookie = cookies.get(getSessionCookieName());
	const user = await getSessionFromCookie(cookie);
	if (!user) {
		throw redirect(303, '/auth/login');
	}
	const subscription = await getSubscriptionForUser(user.id);
	const { priceStarter, pricePro, priceAgency, publishableKey } = getStripeConfig();
	return {
		subscription,
		priceIds: {
			starter: priceStarter,
			pro: pricePro,
			agency: priceAgency
		},
		publishableKey: publishableKey ?? ''
	};
};
