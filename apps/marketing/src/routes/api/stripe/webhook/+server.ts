import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Stripe from 'stripe';
import { env } from '$env/dynamic/private';
import { upsertSubscription, priceIdToPlanTier, getUserIdByStripeSubscriptionId } from '$lib/server/stripe';

const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null;
const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

export const POST: RequestHandler = async ({ request }) => {
	if (!stripe || !webhookSecret) {
		return json({ error: 'Webhook not configured' }, { status: 503 });
	}
	const sig = request.headers.get('stripe-signature');
	if (!sig) {
		return json({ error: 'No signature' }, { status: 400 });
	}
	let event: Stripe.Event;
	try {
		const body = await request.text();
		event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error';
		return json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
	}

	switch (event.type) {
		case 'checkout.session.completed': {
			const session = event.data.object as Stripe.Checkout.Session;
			const userId = (session.client_reference_id ?? session.metadata?.user_id) as string | undefined;
			const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
			if (!userId || !subId) break;
			const sub = await stripe.subscriptions.retrieve(subId);
			const priceId = sub.items.data[0]?.price?.id;
			const planTier = priceId ? priceIdToPlanTier(priceId) : null;
			const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
			if (planTier) {
				await upsertSubscription(userId, {
					stripe_customer_id: customerId ?? null,
					stripe_subscription_id: subId,
					plan_tier: planTier,
					status: sub.status === 'active' ? 'active' : sub.status
				});
			}
			break;
		}
		case 'customer.subscription.updated':
		case 'customer.subscription.deleted': {
			const sub = event.data.object as Stripe.Subscription;
			let userId = sub.metadata?.user_id as string | undefined;
			if (!userId) userId = (await getUserIdByStripeSubscriptionId(sub.id)) ?? undefined;
			if (!userId) break;
			const priceId = sub.items.data[0]?.price?.id;
			const planTier = priceId ? priceIdToPlanTier(priceId) : 'starter';
			const status = sub.status === 'active' ? 'active' : sub.status === 'canceled' ? 'canceled' : sub.status;
			await upsertSubscription(userId, {
				stripe_customer_id: sub.customer as string,
				stripe_subscription_id: sub.id,
				plan_tier: event.type === 'customer.subscription.deleted' ? 'starter' : planTier,
				status: event.type === 'customer.subscription.deleted' ? 'canceled' : status
			});
			break;
		}
		default:
			// ignore other events
			break;
	}

	return json({ received: true });
};
