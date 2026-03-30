/**
 * Tone-based landing templates. Used by:
 * - AI to select which template/theme to use for a demo
 * - DemoLanding to apply tone-specific styling (luxury, rugged, soft-calm, etc.)
 * - generateLandingContent to write copy that matches the chosen tone
 */

export const TONE_SLUGS = [
	'luxury',
	'rugged',
	'soft-calm',
	'professional',
	'friendly',
	'minimal'
] as const;

export type ToneSlug = (typeof TONE_SLUGS)[number];

/** Human-readable labels for AI and UI. */
export const TONE_LABELS: Record<ToneSlug, string> = {
	luxury: 'Luxury',
	rugged: 'Rugged',
	'soft-calm': 'Soft & calm',
	professional: 'Professional',
	friendly: 'Friendly',
	minimal: 'Minimal'
};

/** Short description for Gemini when choosing tone. */
export const TONE_DESCRIPTIONS: Record<ToneSlug, string> = {
	luxury: 'Premium, exclusive, high-end; elegant typography and refined language.',
	rugged: 'Strong, durable, outdoors; bold visuals and confident, no-nonsense copy.',
	'soft-calm': 'Gentle, reassuring, wellness; soft colours and warm, caring language.',
	professional: 'Corporate, trustworthy, expert; clear and authoritative.',
	friendly: 'Approachable, warm, community; conversational and inviting.',
	minimal: 'Clean, simple, modern; lots of whitespace and concise copy.'
};

/** CSS theme / data attribute value for DemoLanding. Drives visual style. */
export const TONE_THEMES: Record<ToneSlug, string> = {
	luxury: 'luxury',
	rugged: 'rugged',
	'soft-calm': 'soft-calm',
	professional: 'professional',
	friendly: 'friendly',
	minimal: 'minimal'
};

/** Default tone when AI does not return a valid one. */
export const DEFAULT_TONE: ToneSlug = 'professional';

/** Allowed tone labels for Gemini (must match TONE_LABELS). */
export const ALLOWED_TONE_LABELS = new Set<string>(Object.values(TONE_LABELS));

export function getThemeForTone(slug: string): string {
	return TONE_THEMES[slug as ToneSlug] ?? TONE_THEMES[DEFAULT_TONE];
}

/**
 * Map a display label (e.g. from Gemini) to a ToneSlug.
 */
export function toneLabelToSlug(label: string): ToneSlug {
	const normalized = label?.trim() ?? '';
	for (const [slug, l] of Object.entries(TONE_LABELS)) {
		if (l.toLowerCase() === normalized.toLowerCase()) return slug as ToneSlug;
	}
	return DEFAULT_TONE;
}
