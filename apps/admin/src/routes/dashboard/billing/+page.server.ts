import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDashboardSessionUser } from '$lib/server/authDashboard';
import { getSubscriptionForUser, getStripeConfig } from '$lib/server/stripe';

export const load: PageServerLoad = async (event) => {
	const user = await getDashboardSessionUser(event);
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
