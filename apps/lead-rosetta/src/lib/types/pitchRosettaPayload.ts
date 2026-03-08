/**
 * Structured JSON contract sent from Lead Rosetta to Pitch Rosetta for demo generation.
 * Matches the index.json shape expected by pitch-rosetta (see apps/pitch-rosetta/index.json,
 * index-dental-downtown.json, index-dental-riverside.json). Dental templates expect
 * business.acceptingNewPatients, services[].coverage, and optional insurance.
 */

export type PitchRosettaPayload = {
	business: {
		name: string;
		tagline?: string;
		description?: string;
		/** Default true for dental; omit or true for others. */
		acceptingNewPatients?: boolean;
		phone?: string;
		email?: string;
		address?: string;
		coordinates?: { lat: number; lng: number } | null;
		hours: Record<string, string>;
		social?: Record<string, string>;
	};
	hero: {
		headline: string;
		subheadline: string;
		cta: { label: string; href: string };
		backgroundStyle: string;
	};
	images: {
		hero: string;
		about: string;
		unsplashKeywords: string[];
	};
	/** For dental use coverage; for others use price. */
	services: Array<
		| { name: string; description?: string; coverage?: string }
		| { name: string; description?: string; price?: string }
	>;
	/** Dental only. */
	insurance?: {
		accepted: string;
		payment: string;
	};
	about: {
		headline: string;
		body: string;
		values: string[];
	};
	stats: Array<{ value: string; label: string }>;
	gallery?: string[];
	testimonials: Array<{ author: string; quote: string; rating: number }>;
	contact: {
		headline: string;
		showForm: boolean;
		showMap: boolean;
		mapEmbed: string | null;
		googleMapsApiKey: string | null;
	};
	theme: {
		style: string;
		primaryColor: string;
		accentColor: string;
	};
	seo: {
		title: string;
		description: string;
		keywords: string[];
	};
};
