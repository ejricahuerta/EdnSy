/**
 * Structured JSON contract sent from Ed & Sy Admin to Website Template for demo generation.
 * Matches the index.json shape expected by website-template (see apps/website-template/index.json,
 * index-dental-downtown.json, index-dental-riverside.json). Services use `price` for all industries in the admin builder.
 */

export type WebsiteTemplatePayload = {
	business: {
		name: string;
		tagline?: string;
		description?: string;
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
	services: Array<{ name: string; description?: string; price?: string; coverage?: string }>;
	/** Optional; legacy dental payloads. */
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
