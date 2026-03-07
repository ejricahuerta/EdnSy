import Stripe from 'stripe';
import { env } from '$env/dynamic/private';
import { getSupabaseAdmin } from '$lib/server/supabase';
import type { PlanTier } from '$lib/plans';

function getStripe(): Stripe | null {
	const key = env.STRIPE_SECRET_KEY;
	if (!key) return null;
	return new Stripe(key);
}

export function getStripeConfig() {
	return {
		secretKey: env.STRIPE_SECRET_KEY,
		publishableKey: env.STRIPE_PUBLISHABLE_KEY,
		webhookSecret: env.STRIPE_WEBHOOK_SECRET,
		priceStarter: env.STRIPE_PRICE_STARTER,
		pricePro: env.STRIPE_PRICE_PRO,
		priceAgency: env.STRIPE_PRICE_AGENCY
	};
}

export type SubscriptionRow = {
	user_id: string;
	stripe_customer_id: string | null;
	stripe_subscription_id: string | null;
	plan_tier: string;
	status: string;
};

/**
 * Get user_id for a Stripe subscription ID (from our subscriptions table). Used by webhook when metadata is missing.
 */
export async function getUserIdByStripeSubscriptionId(stripeSubscriptionId: string): Promise<string | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data, error } = await supabase
		.from('subscriptions')
		.select('user_id')
		.eq('stripe_subscription_id', stripeSubscriptionId)
		.maybeSingle();
	if (error || !data) return null;
	return data.user_id;
}

/**
 * Get subscription row for user. Returns null if none or not configured.
 */
export async function getSubscriptionForUser(userId: string): Promise<SubscriptionRow | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data, error } = await supabase
		.from('subscriptions')
		.select('user_id, stripe_customer_id, stripe_subscription_id, plan_tier, status')
		.eq('user_id', userId)
		.maybeSingle();
	if (error || !data) return null;
	return data as SubscriptionRow;
}

/** Internal domain: users with this email domain get Agency plan (all features across all tiers) without a Stripe subscription. */
const INTERNAL_DOMAIN = 'ednsy.com';

/**
 * Resolve plan tier for the user: internal (@ednsy.com) = Agency; else from subscription if active; else starter (signed-in) or free.
 */
export async function getPlanForUser(user: { id: string; email: string } | null): Promise<PlanTier> {
	if (!user) return 'free';
	const emailDomain = user.email?.split('@')[1]?.toLowerCase();
	if (emailDomain === INTERNAL_DOMAIN) return 'teams';
	const sub = await getSubscriptionForUser(user.id);
	if (sub && sub.status === 'active' && ['starter', 'pro', 'teams'].includes(sub.plan_tier)) {
		return sub.plan_tier as PlanTier;
	}
	return 'starter';
}

/**
 * Upsert subscription row (from webhook or after checkout).
 */
export async function upsertSubscription(
	userId: string,
	updates: {
		stripe_customer_id?: string | null;
		stripe_subscription_id?: string | null;
		plan_tier?: string;
		status?: string;
	}
): Promise<void> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return;
	const row = {
		...updates,
		updated_at: new Date().toISOString()
	};
	await supabase.from('subscriptions').upsert(
		{
			user_id: userId,
			stripe_customer_id: updates.stripe_customer_id ?? null,
			stripe_subscription_id: updates.stripe_subscription_id ?? null,
			plan_tier: updates.plan_tier ?? 'starter',
			status: updates.status ?? 'active',
			updated_at: row.updated_at
		},
		{ onConflict: 'user_id' }
	);
}

/**
 * Map Stripe price ID to our plan tier.
 */
export function priceIdToPlanTier(priceId: string): PlanTier | null {
	const { priceStarter, pricePro, priceAgency } = getStripeConfig();
	if (priceId === priceStarter) return 'starter';
	if (priceId === pricePro) return 'pro';
	if (priceId === priceAgency) return 'teams';
	return null;
}

/**
 * Create a Checkout Session for subscription. Returns URL to redirect to.
 */
export async function createCheckoutSession(
	userId: string,
	userEmail: string,
	priceId: string,
	successUrl: string,
	cancelUrl: string
): Promise<{ url: string } | { error: string }> {
	const stripe = getStripe();
	if (!stripe) return { error: 'Stripe not configured' };
	const planTier = priceIdToPlanTier(priceId);
	if (!planTier) return { error: 'Invalid price' };

	const session = await stripe.checkout.sessions.create({
		mode: 'subscription',
		payment_method_types: ['card'],
		line_items: [{ price: priceId, quantity: 1 }],
		success_url: successUrl,
		cancel_url: cancelUrl,
		client_reference_id: userId,
		customer_email: userEmail,
		subscription_data: {
			metadata: { user_id: userId }
		}
	});

	if (!session.url) return { error: 'Could not create checkout session' };
	return { url: session.url };
}

/**
 * Create a Customer Portal session for managing subscription. Returns URL.
 */
export async function createPortalSession(
	customerId: string,
	returnUrl: string
): Promise<{ url: string } | { error: string }> {
	const stripe = getStripe();
	if (!stripe) return { error: 'Stripe not configured' };
	const session = await stripe.billingPortal.sessions.create({
		customer: customerId,
		return_url: returnUrl
	});
	if (!session.url) return { error: 'Could not create portal session' };
	return { url: session.url };
}

export type UpcomingBill = {
	amountDue: number;
	currency: string;
	periodEnd: number;
};

/**
 * Get upcoming invoice for the user's subscription. Returns null if no subscription or not configured.
 */
export async function getUpcomingInvoiceForUser(userId: string): Promise<UpcomingBill | null> {
	const stripe = getStripe();
	if (!stripe) return null;
	const sub = await getSubscriptionForUser(userId);
	if (!sub?.stripe_subscription_id) return null;
	try {
		const invoice = await stripe.invoices.retrieveUpcoming({
			subscription: sub.stripe_subscription_id
		});
		if (!invoice?.amount_due) return null;
		return {
			amountDue: invoice.amount_due,
			currency: (invoice.currency ?? 'usd').toLowerCase(),
			periodEnd: invoice.period_end ?? 0
		};
	} catch {
		return null;
	}
}
