/**
 * Schema for index.json consumed by the in-app demo landing generator (3-part Gemini) and website-template.
 * Flexible: not all fields are required; the prompt maps whatever is present to sections.
 */

export type LandingPageIndexJson = {
	business?: {
		name?: string;
		tagline?: string;
		description?: string;
		logo?: string | null;
		founded?: string;
		phone?: string;
		email?: string;
		address?: string;
		city?: string;
		coordinates?: { lat: number; lng: number };
		hours?: Record<string, string>;
		social?: Record<string, string>;
	};
	hero?: {
		headline?: string;
		subheadline?: string;
		cta?: { label: string; href: string };
		image?: string | null;
		backgroundStyle?: 'image' | 'gradient' | 'video' | 'pattern';
	};
	services?: Array<{
		name: string;
		description?: string;
		price?: string;
		icon?: string | null;
		image?: string | null;
	}>;
	products?: Array<{
		name: string;
		description?: string;
		price?: string;
		image?: string | null;
		badge?: string | null;
	}>;
	about?: {
		headline?: string;
		body?: string;
		image?: string | null;
		values?: string[];
	};
	team?: Array<{
		name: string;
		role?: string;
		bio?: string;
		photo?: string | null;
	}>;
	gallery?: string[];
	testimonials?: Array<{
		author: string;
		role?: string;
		quote: string;
		avatar?: string | null;
		rating?: number;
	}>;
	faq?: Array<{ question: string; answer: string }>;
	process?: Array<{ step: number; title: string; description?: string }>;
	stats?: Array<{ value: string; label: string }>;
	cta_banner?: {
		headline?: string;
		subtext?: string;
		button?: { label: string; href: string };
	};
	contact?: {
		headline?: string;
		showForm?: boolean;
		showMap?: boolean;
		googleMapsApiKey?: string | null;
		mapEmbed?: string | null;
		mapPlaceId?: string | null;
	};
	images?: {
		hero?: string | null;
		about?: string | null;
		gallery?: string[];
		unsplashKeywords?: string[];
	};
	theme?: {
		primaryColor?: string | null;
		accentColor?: string | null;
		font?: string | null;
		style?: string;
		preset?: string | null;
	};
	valuePropositions?: string[];
	primaryCta?: string;
	seo?: {
		title?: string;
		description?: string;
		keywords?: string[];
	};
};
