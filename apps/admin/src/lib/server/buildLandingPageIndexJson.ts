/**
 * Build index.json for the in-app demo landing (3-part Gemini generator) from prospect + GBP + industry + tone + images.
 * Fills missing items with sample-like data so the cinematic builder has full content to render.
 */

import type { Prospect } from '$lib/server/prospects';
import type { GbpData, GbpReview } from '$lib/server/gbp';
import type { ToneSlug } from '$lib/tones';
import type { LandingPageIndexJson } from '$lib/types/landingPageIndexJson';
import type { LandingContentFromAi } from '$lib/server/generateLandingPageContentFromGbp';

function getAreaFromAddress(address: string): string {
	if (!address?.trim()) return '';
	const match = address.match(/,?\s*([A-Za-z\s]+),\s*[A-Z]{2}\s*(?:\d|$)/);
	return match?.[1]?.trim() ?? '';
}

/** Theme colors and style label by tone (aligned with demo theme.style and presets). */
function getThemeForTone(tone: ToneSlug): {
	primaryColor: string;
	accentColor: string;
	style: string;
} {
	const map: Record<ToneSlug, { primaryColor: string; accentColor: string; style: string }> = {
		luxury: { primaryColor: '#0f0f0f', accentColor: '#c9a962', style: 'luxury' },
		rugged: { primaryColor: '#1c1917', accentColor: '#b45309', style: 'bold' },
		'soft-calm': { primaryColor: '#374151', accentColor: '#7c3aed', style: 'minimal' },
		professional: { primaryColor: '#0f172a', accentColor: '#0369a1', style: 'modern' },
		friendly: { primaryColor: '#1f2937', accentColor: '#059669', style: 'playful' },
		minimal: { primaryColor: '#111827', accentColor: '#111827', style: 'minimal' }
	};
	return map[tone] ?? map.professional;
}

/** Default services (3 items; name, description, price). Dental-only product scope. */
function getDefaultServices(_name: string, _industryLabel: string, area: string): LandingPageIndexJson['services'] {
	const loc = area ? ` in ${area}` : '';
	return [
		{ name: 'General Dentistry', description: `Cleanings, exams, and preventive care${loc}.`, price: '—' },
		{ name: 'Restorative Care', description: 'Fillings, crowns, and repairs to restore your smile.', price: '—' },
		{ name: 'Cosmetic & Whitening', description: 'Teeth whitening and cosmetic procedures.', price: 'Contact us' }
	];
}

/** Default about copy and values by industry. */
function getDefaultAbout(name: string, industryLabel: string, area: string): NonNullable<LandingPageIndexJson['about']> {
	const loc = area ? ` in ${area}` : '';
	return {
		headline: `${name} — ${industryLabel}${loc}`,
		body: `${name} provides ${industryLabel.toLowerCase()} services${loc}. We focus on quality, clear communication, and your satisfaction.`,
		values: ['Quality', 'Trust', 'Local', 'Service']
	};
}

/** Default FAQ (3–4 items) by industry. */
function getDefaultFaq(industryLabel: string, area: string): NonNullable<LandingPageIndexJson['faq']> {
	const loc = area || 'the local area';
	return [
		{ question: 'What areas do you serve?', answer: `We serve ${loc} and surrounding communities.` },
		{ question: 'How can I get started?', answer: 'Reach out via the contact form or give us a call. We respond quickly.' },
		{ question: 'Do you offer free consultations?', answer: 'We’re happy to discuss your needs. Get in touch to arrange a call or visit.' }
	];
}

/** Default process steps (3). */
function getDefaultProcess(): NonNullable<LandingPageIndexJson['process']> {
	return [
		{ step: 1, title: 'Get in touch', description: 'Reach out by phone or the contact form. We respond within 24 hours.' },
		{ step: 2, title: 'We discuss your needs', description: 'We listen and outline options, timing, and next steps.' },
		{ step: 3, title: 'We deliver', description: 'We get the job done and follow up to make sure you’re satisfied.' }
	];
}

/** Default stats (4). Never use 0 or placeholder "Local & Trusted"; use plausible values so demos look credible. */
function getDefaultStats(name: string, gbp: GbpData | null): NonNullable<LandingPageIndexJson['stats']> {
	const rating = (gbp?.ratingValue != null && gbp.ratingValue > 0) ? gbp.ratingValue : 4.9;
	const reviewCount = (gbp?.ratingCount != null && gbp.ratingCount > 0) ? gbp.ratingCount : null;
	return [
		{ value: reviewCount != null ? String(reviewCount) : '100+', label: 'Reviews' },
		{ value: String(rating), label: 'Average Rating ★' },
		{ value: '15+', label: 'Years Experience' },
		{ value: '500+', label: 'Happy Clients' }
	];
}

/** Map GBP reviews to testimonials (author as "Google Reviewer" or initial). */
function mapReviewsToTestimonials(reviews: GbpReview[], avatarUrl: string): NonNullable<LandingPageIndexJson['testimonials']> {
	return reviews.slice(0, 5).map((r) => ({
		author: 'Google Reviewer',
		role: 'Google',
		quote: (r.text || '').trim() || 'Great experience. Would recommend.',
		avatar: avatarUrl,
		rating: typeof r.rating === 'number' && r.rating >= 1 && r.rating <= 5 ? r.rating : 5
	}));
}

/** Fallback testimonials when no reviews. */
function getFallbackTestimonials(industryLabel: string, area: string, avatarUrl: string): NonNullable<LandingPageIndexJson['testimonials']> {
	return [
		{ author: 'Sarah M.', role: area || 'Local', quote: 'Professional and reliable. Would recommend to anyone.', avatar: avatarUrl, rating: 5 },
		{ author: 'James K.', role: area || 'GTA', quote: 'Great experience from start to finish. Highly recommend.', avatar: avatarUrl, rating: 5 }
	];
}

/** Unsplash keywords for image fallbacks. */
function getUnsplashKeywords(industryLabel: string): string[] {
	return ['dental', 'dentist', 'clinic', 'smile', industryLabel.toLowerCase()];
}

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80';

export type BuildLandingPageIndexJsonInput = {
	prospect: Prospect;
	gbpRaw: GbpData | null;
	industryLabel: string;
	tone: ToneSlug;
	imageUrls: { hero: string; about: string };
	/** When set, used instead of industry defaults (e.g. from inferServicesFromAi). */
	servicesOverride?: LandingPageIndexJson['services'];
	/** When set, all copy (hero, services, about, seo, etc.) comes from this AI-generated content. */
	contentFromAi?: LandingContentFromAi;
};

/**
 * Remove null, undefined, and empty objects/arrays so the payload sent to Claude is smaller.
 * Keeps the same structure; only omits keys that add no information.
 */
function narrowForApi(obj: unknown): unknown {
	if (obj === null || obj === undefined) return undefined;
	if (Array.isArray(obj)) {
		const arr = obj.map(narrowForApi).filter((v) => v !== undefined);
		return arr.length === 0 ? undefined : arr;
	}
	if (typeof obj === 'object') {
		const out: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(obj)) {
			const narrowed = narrowForApi(v);
			if (narrowed === undefined || narrowed === null) continue;
			if (typeof narrowed === 'object' && !Array.isArray(narrowed) && Object.keys(narrowed as object).length === 0) continue;
			out[k] = narrowed;
		}
		return Object.keys(out).length === 0 ? undefined : out;
	}
	return obj;
}

/** Return a copy of the full index.json with null/undefined/empty stripped for a smaller API payload. */
export function narrowLandingPageJsonForApi(full: LandingPageIndexJson): Record<string, unknown> {
	const narrowed = narrowForApi(full);
	return (typeof narrowed === 'object' && narrowed !== null && !Array.isArray(narrowed) ? narrowed : {}) as Record<string, unknown>;
}

export type MergeWebsiteDemoJsonInput = {
	websiteDemoJson: LandingPageIndexJson;
	gbpRaw: GbpData;
	prospect: Prospect;
	industryLabel: string;
	tone: ToneSlug;
	imageUrls: { hero: string; about: string };
};

/**
 * Use website-agent demo JSON as the primary base and merge in gbpRaw (contact, hours, map) and imageUrls.
 * Called when scraped_data.demoJson exists so the demo step uses website-derived copy with real contact data.
 */
export function mergeWebsiteDemoJsonWithGbp(input: MergeWebsiteDemoJsonInput): LandingPageIndexJson {
	const { websiteDemoJson, gbpRaw, prospect, industryLabel, tone, imageUrls } = input;
	const name = gbpRaw?.name || prospect.companyName?.trim() || websiteDemoJson.business?.name || 'This Business';
	const address = gbpRaw?.address || prospect.address || websiteDemoJson.business?.address || '';
	const phone = gbpRaw?.phone || prospect.phone || websiteDemoJson.business?.phone || '';
	const email = prospect.email?.trim() || '';
	const area = getAreaFromAddress(address);
	const city = prospect.city || area;
	const theme = getThemeForTone(tone);
	const primaryCtaLabel = 'Get in touch';
	const primaryCtaHref = phone ? `tel:${phone.replace(/\s/g, '')}` : '#contact';

	let hours: Record<string, string> = {
		'Monday–Friday': '9am – 6pm',
		Saturday: '10am – 4pm',
		Sunday: 'Closed'
	};
	if (gbpRaw?.workHours && typeof gbpRaw.workHours === 'object') {
		const wh = gbpRaw.workHours as Record<string, unknown>;
		if (Object.keys(wh).length > 0) {
			hours = {};
			for (const [day, value] of Object.entries(wh)) {
				if (typeof value === 'string') hours[day] = value;
			}
		}
	}

	const base = JSON.parse(JSON.stringify(websiteDemoJson)) as LandingPageIndexJson;
	base.business = {
		...base.business,
		name,
		phone: phone || undefined,
		email: email || undefined,
		address: address || undefined,
		city: city || undefined,
		hours
	};
	base.contact = {
		...base.contact,
		showForm: true,
		showMap: !!address,
		googleMapsApiKey: null,
		mapEmbed: null,
		mapPlaceId: null
	};
	base.images = {
		...base.images,
		hero: imageUrls.hero,
		about: imageUrls.about,
		gallery: [imageUrls.hero, imageUrls.about],
		unsplashKeywords: base.images?.unsplashKeywords ?? getUnsplashKeywords(industryLabel)
	};
	base.theme = {
		...base.theme,
		primaryColor: theme.primaryColor,
		accentColor: theme.accentColor,
		style: theme.style
	};
	if (base.hero?.cta) {
		base.hero.cta = { label: primaryCtaLabel, href: primaryCtaHref };
	}
	if (base.cta_banner?.button) {
		base.cta_banner.button = { label: primaryCtaLabel, href: primaryCtaHref };
	}
	return base;
}

/**
 * Build full index.json for the in-app demo landing generator.
 * Uses prospect + GBP + industry + tone + image URLs; fills any missing items with sample-like data.
 */
export function buildLandingPageIndexJson(input: BuildLandingPageIndexJsonInput): LandingPageIndexJson {
	const { prospect, gbpRaw, industryLabel, tone, imageUrls, servicesOverride, contentFromAi } = input;
	const rawName = gbpRaw?.name || prospect.companyName?.trim() || 'This Business';
	// Display name only: strip SEO-style " | ..." so we never show "Business Name | Dental Care in City"
	const name = typeof rawName === 'string' && rawName.includes(' | ') ? rawName.split(' | ')[0].trim() || rawName : rawName;
	const address = gbpRaw?.address || prospect.address || '';
	const phone = gbpRaw?.phone || prospect.phone || '';
	const email = prospect.email?.trim() || '';
	const website = gbpRaw?.website || prospect.website || '';
	const area = getAreaFromAddress(address);
	const city = prospect.city || area;
	const theme = getThemeForTone(tone);
	const primaryCtaLabel = 'Get in touch';
	const primaryCtaHref = phone ? `tel:${phone.replace(/\s/g, '')}` : '#contact';

	const ai = contentFromAi;
	const services = (ai?.services?.length
		? (ai.services as LandingPageIndexJson['services'])
		: servicesOverride ?? (getDefaultServices(name, industryLabel, area) ?? []).slice(0, 3)) as LandingPageIndexJson['services'];
	const defaultAbout = getDefaultAbout(name, industryLabel, area);
	const about = ai?.about
		? { ...defaultAbout, headline: ai.about.headline ?? defaultAbout.headline, body: ai.about.body ?? defaultAbout.body, values: ai.about.values ?? defaultAbout.values, image: imageUrls.about }
		: { ...defaultAbout, image: imageUrls.about };
	const faq = getDefaultFaq(industryLabel, area);
	const process = getDefaultProcess();
	const stats = (ai?.stats?.length ? ai.stats : getDefaultStats(name, gbpRaw ?? null)) as LandingPageIndexJson['stats'];
	const reviews = gbpRaw?.reviews?.filter((r) => (r.text ?? '').trim().length > 0) ?? [];
	const testimonialsRaw =
		reviews.length > 0 ? mapReviewsToTestimonials(reviews, DEFAULT_AVATAR) : getFallbackTestimonials(industryLabel, area, DEFAULT_AVATAR);
	const testimonials = testimonialsRaw.slice(0, 3);
	const unsplashKeywords = getUnsplashKeywords(industryLabel);

	let hours: Record<string, string> = {
		'Monday–Friday': '9am – 6pm',
		Saturday: '10am – 4pm',
		Sunday: 'Closed'
	};
	if (gbpRaw?.workHours && typeof gbpRaw.workHours === 'object') {
		const wh = gbpRaw.workHours as Record<string, unknown>;
		if (Object.keys(wh).length > 0) {
			hours = {};
			for (const [day, value] of Object.entries(wh)) {
				if (typeof value === 'string') hours[day] = value;
			}
		}
	}

	const oneLiner = `${industryLabel} services${city ? ` in ${city}` : ''} — quality and trust.`;
	const tagline = ai?.business?.tagline ?? oneLiner;
	const description = ai?.business?.description ?? defaultAbout.body;
	const heroCta = ai?.hero?.cta ?? { label: primaryCtaLabel, href: primaryCtaHref };
	const ctaBanner = ai?.cta_banner ?? {
		headline: 'Ready to get started?',
		subtext: `Get in touch with ${name} today.`,
		button: { label: primaryCtaLabel, href: primaryCtaHref }
	};

	return {
		business: {
			name,
			tagline,
			description,
			logo: null,
			phone: phone || undefined,
			email: email || undefined,
			address: address || undefined,
			city: city || undefined,
			hours,
			social: {}
		},
		hero: {
			headline: ai?.hero?.headline ?? `${name}. ${industryLabel}${city ? ` in ${city}` : ''}.`,
			subheadline: ai?.hero?.subheadline ?? oneLiner,
			cta: heroCta,
			image: imageUrls.hero,
			backgroundStyle: 'image'
		},
		services,
		about,
		stats,
		testimonials,
		faq,
		process,
		cta_banner: ctaBanner,
		contact: {
			headline: ai?.contact?.headline ?? 'Contact us',
			showForm: true,
			showMap: !!address,
			googleMapsApiKey: null,
			mapEmbed: null,
			mapPlaceId: null
		},
		images: {
			hero: imageUrls.hero,
			about: imageUrls.about,
			gallery: [imageUrls.hero, imageUrls.about],
			unsplashKeywords
		},
		theme: {
			primaryColor: theme.primaryColor,
			accentColor: theme.accentColor,
			font: null,
			style: theme.style,
			preset: null
		},
		valuePropositions: about.values,
		primaryCta: primaryCtaLabel,
		seo: ai?.seo
			? {
					title: ai.seo.title ?? `${name} | ${industryLabel}${city ? ` in ${city}` : ''}`,
					description: ai.seo.description ?? `${name} — ${oneLiner}`,
					keywords: (ai.seo.keywords?.length ? ai.seo.keywords : [industryLabel, name, city, area].filter(Boolean)) as string[]
				}
			: {
					title: `${name} | ${industryLabel}${city ? ` in ${city}` : ''}`,
					description: `${name} — ${oneLiner}`,
					keywords: [industryLabel, name, city, area].filter(Boolean)
				}
	};
}
