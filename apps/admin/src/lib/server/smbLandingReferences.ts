/**
 * SMB industry landing page references for Claude landing page prompt.
 * Dental-only product scope.
 */

import type { IndustrySlug } from '$lib/industries';

export type SmbReference = {
	reference: string;
	keyElements: string;
};

const SMB_REFERENCES: Record<IndustrySlug, SmbReference> = {
	dental: {
		reference: 'tendental.com — modern dental, warm & inviting',
		keyElements: 'Booking widget, insurance logos, before/after, location finder'
	}
};

/**
 * Get the SMB reference line and key elements for the given industry slug.
 */
export function getSmbReferenceForIndustry(slug: IndustrySlug | string): SmbReference {
	return SMB_REFERENCES[slug as IndustrySlug] ?? SMB_REFERENCES.dental;
}
