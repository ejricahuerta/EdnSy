/**
 * SMB industry landing page references for Claude landing page prompt.
 */

import type { IndustrySlug } from '$lib/industries';

export type SmbReference = {
	reference: string;
	keyElements: string;
};

const GENERIC: SmbReference = {
	reference: 'Strong local SMB sites — clear hero, trust signals, simple navigation',
	keyElements: 'Contact block, service highlights, reviews or social proof, mobile-friendly layout'
};

const SMB_REFERENCES: Record<IndustrySlug, SmbReference> = {
	dental: {
		reference: 'tendental.com — modern dental, warm & inviting',
		keyElements: 'Booking widget, insurance logos, before/after, location finder'
	},
	legal: {
		reference: 'Clio-style firm sites — practice areas, attorney trust',
		keyElements: 'Practice areas, attorney bios, consultation CTA, contact form'
	},
	medical: {
		reference: 'Local clinic sites — approachable, HIPAA-minded tone',
		keyElements: 'Hours, services, booking or phone CTA, provider intro'
	},
	fitness: {
		reference: 'Boutique gym sites — energy and community',
		keyElements: 'Class schedule, trial offer, trainer highlights, location'
	},
	restaurant: {
		reference: 'Modern restaurant sites — menu-forward, reservation CTA',
		keyElements: 'Menu preview, hours, map, online ordering or reservations'
	},
	beauty: {
		reference: 'Salon and spa sites — visual, booking-first',
		keyElements: 'Service menu, gallery, book online, stylists or team'
	},
	'home-services': {
		reference: 'Trade contractor sites — proof and fast contact',
		keyElements: 'Service areas, before/after or project photos, quote CTA, licenses'
	},
	'real-estate': {
		reference: 'Agent and brokerage sites — listings and credibility',
		keyElements: 'Featured listings, neighborhood focus, contact, testimonials'
	},
	accounting: {
		reference: 'CPA and bookkeeping sites — clarity and compliance tone',
		keyElements: 'Services, tax season CTA, credentials, secure contact'
	},
	other: GENERIC
};

/**
 * Get the SMB reference line and key elements for the given industry slug.
 */
export function getSmbReferenceForIndustry(slug: IndustrySlug | string): SmbReference {
	const ref = SMB_REFERENCES[slug as IndustrySlug];
	return ref ?? GENERIC;
}
