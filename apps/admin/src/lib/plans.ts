/**
 * Ed & Sy Admin: internal admin app. No plan tiers or billing -- all features are always available.
 * Kept as a module so existing imports don't break; every gate returns "allowed".
 */

/** True when the user's email host is exactly ednsy.com. */
export function isEdnsyUser(user: { email?: string } | null): boolean {
	const raw = (user?.email ?? '').toLowerCase().trim();
	if (!raw.includes('@')) return false;
	const domain = raw.split('@').pop() ?? '';
	return domain === 'ednsy.com';
}
