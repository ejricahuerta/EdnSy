/**
 * Plan tiers per PRD Section 7: Free (no plan), Starter ($49), Pro ($99), Agency ($299).
 * Limits: Starter 30 demos/month, Pro 100 demos/month, Agency unlimited.
 * Internal @ednsy.com users are resolved as Agency (teams) in getPlanForUser and have all features across all tiers.
 */
export type PlanTier = 'free' | 'starter' | 'pro' | 'teams';

/** True for Agency (teams). Internal ednsy.com users are resolved as teams and thus have all tier features. */
export function hasAllTierFeatures(plan: PlanTier): boolean {
	return plan === 'teams';
}

/** Free tier: demos per month on /try (no account). PRD 4.1 says "1 demo per session"; we use 5/month as a generous limit. */
export const FREE_BRIEFINGS_PER_MONTH = 5;

/** Display labels for plan (PRD: Free, Starter, Pro, Agency). */
export const PLAN_LABELS: Record<PlanTier, string> = {
	free: 'Free',
	starter: 'Starter',
	pro: 'Pro',
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

/** Demo limits per PRD: Starter 30, Pro 100, Agency unlimited. Free: 0 (no dashboard). */
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

/** Whether the user can connect CRM (HubSpot, GoHighLevel). Pro and Agency only. */
export function canConnectCrm(plan: PlanTier): boolean {
	return plan === 'pro' || plan === 'teams';
}
