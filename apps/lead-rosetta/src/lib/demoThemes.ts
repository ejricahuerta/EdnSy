/**
 * Style-guides v1.3 theme mapping for demos.
 * Theme is chosen from Gemini-inferred tone (best fit for the business); industry mapping is fallback only.
 */

import type { IndustrySlug } from '$lib/industries';
import type { ToneSlug } from '$lib/tones';
import { DEFAULT_TONE } from '$lib/tones';

/** v1.3 theme folder names under docs/style-guides-v1.3/themes/ */
export const V13_THEMES = [
	'friendly-local',
	'reliable-professional',
	'warm-trustworthy',
	'vibrant-inviting',
	'polished-credible',
	'experiential-sensory',
	'bold-results-driven',
	'aspirational-lifestyle'
] as const;

export type V13Theme = (typeof V13_THEMES)[number];

/** data-layout value per theme (from README). */
export const THEME_LAYOUT: Record<V13Theme, string> = {
	'friendly-local': 'centered',
	'reliable-professional': 'split',
	'warm-trustworthy': 'fullbleed',
	'vibrant-inviting': 'bento',
	'polished-credible': 'narrow',
	'experiential-sensory': 'cinematic',
	'bold-results-driven': 'dense',
	'aspirational-lifestyle': 'lifestyle'
};

/** Tone (Gemini-chosen) → v1.3 theme. Used to pick demo theme from AI-selected tone. */
export const TONE_TO_V13_THEME: Record<ToneSlug, V13Theme> = {
	luxury: 'aspirational-lifestyle',
	rugged: 'bold-results-driven',
	'soft-calm': 'warm-trustworthy',
	professional: 'polished-credible',
	friendly: 'friendly-local',
	minimal: 'reliable-professional'
};

/** Industry → v1.3 theme. Fallback when tone is not available (e.g. legacy or free-demo). */
export const INDUSTRY_TO_V13_THEME: Record<IndustrySlug, V13Theme> = {
	healthcare: 'warm-trustworthy',
	dental: 'polished-credible',
	construction: 'reliable-professional',
	salons: 'vibrant-inviting',
	professional: 'polished-credible',
	'real-estate': 'aspirational-lifestyle',
	legal: 'polished-credible',
	fitness: 'bold-results-driven'
};

/** Prefer theme from Gemini-chosen tone; use when creating demos so the best-fit tone drives the theme. */
export function getV13ThemeForTone(tone: ToneSlug): V13Theme {
	return TONE_TO_V13_THEME[tone] ?? TONE_TO_V13_THEME[DEFAULT_TONE];
}

export function getThemeForIndustry(industrySlug: string): V13Theme {
	const theme = INDUSTRY_TO_V13_THEME[industrySlug as IndustrySlug];
	return theme ?? 'polished-credible';
}

/** Resolve V13 theme from stored layout (e.g. pageJson.hero.type) when loading an existing demo. */
export function getThemeForLayout(layout: string): V13Theme {
	for (const [theme, layoutValue] of Object.entries(THEME_LAYOUT) as [V13Theme, string][]) {
		if (layoutValue === layout) return theme;
	}
	return 'polished-credible';
}

export function getLayoutForTheme(theme: V13Theme): string {
	return THEME_LAYOUT[theme];
}
