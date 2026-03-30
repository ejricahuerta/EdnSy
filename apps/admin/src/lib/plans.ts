/**
 * Plan tiers: Free (no plan), Starter ($79 base + $1/demo), Growth ($199 base + $0.80/demo), Agency ($499 base + $0.60/demo).
 * Internal @ednsy.com users are resolved as Agency (teams) in getPlanForUser and have all features across all tiers.
 */
export type PlanTier = 'free' | 'starter' | 'pro' | 'teams';

/** True for Agency (teams). Internal ednsy.com users are resolved as teams and thus have all tier features. */
export function hasAllTierFeatures(plan: PlanTier): boolean {
	return plan === 'teams';
}

/** True when the user's email domain is @ednsy.com. Used for internal-only features (e.g. AI Agent Page). */
export function isEdnsyUser(user: { email?: string } | null): boolean {
	return (user?.email ?? '').toLowerCase().endsWith('@ednsy.com');
}

/** Free tier: demos per month on /try (no account). One demo when not signed in; sign in for more. */
export const FREE_DEMOS_PER_MONTH = 1;

/** Display labels for plan (Starter, Growth, Agency). Internal tier "pro" displays as "Growth". */
export const PLAN_LABELS: Record<PlanTier, string> = {
	free: 'Free',
	starter: 'Starter',
	pro: 'Growth',
	teams: 'Agency'
};

/**
 * Resolve plan for the current user. No billing yet: signed-in = starter, else free.
 * When Stripe is integrated, read subscription to return 'starter' | 'pro' | 'teams' (Agency).
 */
export function getPlanTier(user: { id: string; email: string } | null): PlanTier {
	return user ? 'starter' : 'free';
}

/** Whether the user can create shareable demo links (Starter and above). */
export function canCreateShareableDemos(plan: PlanTier): boolean {
	return plan === 'starter' || plan === 'pro' || plan === 'teams';
}

/** Whether the user can export CSV (Starter and above). */
export function canExportCsv(plan: PlanTier): boolean {
	return plan === 'starter' || plan === 'pro' || plan === 'teams';
}

/** Whether the user can upload CSV (Starter and above). Free tier cannot upload CSV. */
export function canUploadCsv(plan: PlanTier): boolean {
	return plan === 'starter' || plan === 'pro' || plan === 'teams';
}

/** Demo limits: Starter 30, Growth 100, Agency unlimited. Free: 0 (no dashboard). */
export const STARTER_DEMOS_PER_MONTH = 30;
export const PRO_DEMOS_PER_MONTH = 100;

export function getDemoCreationLimit(plan: PlanTier): number | null {
	if (plan === 'free') return 0;
	if (plan === 'starter') return STARTER_DEMOS_PER_MONTH;
	if (plan === 'pro') return PRO_DEMOS_PER_MONTH;
	return null; // teams (Agency) = unlimited
}

/** Whether the user can use automated send (email via app; SMS backlogged). Starter and above for v1 so we can send to clients; may restrict to Pro/Agency later. */
export function canSendAutomated(plan: PlanTier): boolean {
	return plan === 'starter' || plan === 'pro' || plan === 'teams';
}

/** Whether the user can connect CRM (HubSpot, GoHighLevel). Growth and Agency only. */
export function canConnectCrm(plan: PlanTier): boolean {
	return plan === 'pro' || plan === 'teams';
}
