/**
 * SMB industry landing page references for Claude landing page prompt.
 * Source: docs/smb-landing-page-references.md
 * Use in the STYLE "Reference:" line and key elements for the prompt.
 */

import type { IndustrySlug } from '$lib/industries';

export type SmbReference = {
	/** e.g. "sweetgreen.com vibes — light, clean, lots of white space" */
	reference: string;
	/** Short line for prompt: industry-specific elements to include */
	keyElements: string;
};

/** Map industry slug to reference site + vibe and key elements. */
const SMB_REFERENCES: Record<IndustrySlug, SmbReference> = {
	healthcare: {
		reference: 'onemedical.com — clean medical, warm and approachable',
		keyElements: 'Booking widget, insurance logos, before/after, location finder'
	},
	dental: {
		reference: 'tendental.com — modern dental, warm & inviting',
		keyElements: 'Booking widget, insurance logos, before/after, location finder'
	},
	construction: {
		reference: 'lawnstarter.com — clean & trustworthy; or thumbtack.com for modern trades',
		keyElements: 'Zip code / quote widget hero, service area map, trust badges, Google reviews'
	},
	salons: {
		reference: 'exhalespa.com — clean spa; or headshed.com.au for warm & editorial',
		keyElements: 'Booking button above the fold, before/after gallery, stylist bios, service menu'
	},
	professional: {
		reference: 'maven.com — clean e-learning; or compass.com for modern clean',
		keyElements: 'Outcome stats, credibility, testimonials, clear CTA'
	},
	'real-estate': {
		reference: 'compass.com — modern clean; or theagencyre.com for luxury brokerage',
		keyElements: 'Property search hero, recent listings, agent credibility stats, contact form'
	},
	legal: {
		reference: 'fishmanhaygood.com — clean & trustworthy; or bainbridgelegal.com for modern boutique',
		keyElements: 'Practice areas grid, attorney bios, case results/stats, free consultation CTA'
	},
	fitness: {
		reference: 'barrys.com — boutique studio minimal; or equinox.com for bold & energetic',
		keyElements: 'Class schedule, transformation testimonials, free trial CTA, instructor spotlight'
	}
};

/** Default when industry is unknown (e.g. from GBP free text). */
const DEFAULT_REFERENCE: SmbReference = {
	reference: 'sweetgreen.com vibes — light, clean, lots of white space, fresh accents',
	keyElements: 'Clear hero, trust signals, testimonials, strong CTA'
};

/**
 * Get the SMB reference line and key elements for the given industry slug.
 * Use in Claude landing page prompt STYLE section.
 */
export function getSmbReferenceForIndustry(slug: IndustrySlug | string): SmbReference {
	return SMB_REFERENCES[slug as IndustrySlug] ?? DEFAULT_REFERENCE;
}
