/**
 * Build a usable browser href when the CRM stores bare domains or paths without a scheme.
 * Keeps /app paths, http(s), protocol-relative //, and other schemes (mailto:, tel:) unchanged.
 */
export function normalizeExternalHref(raw: string | null | undefined): string | null {
	const trimmed = (raw ?? '').trim();
	if (!trimmed) return null;
	if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed;
	if (/^https?:\/\//i.test(trimmed)) return trimmed;
	if (trimmed.startsWith('//')) return `https:${trimmed}`;
	if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
	return `https://${trimmed}`;
}

/** True for same-site paths like /try or /dashboard/foo (not //evil.com). */
export function isSameOriginPathHref(href: string | null | undefined): boolean {
	const t = (href ?? '').trim();
	return t.startsWith('/') && !t.startsWith('//');
}
