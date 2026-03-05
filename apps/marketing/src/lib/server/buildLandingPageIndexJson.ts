/**
 * Build index.json for the landing-page.md prompt from prospect + GBP + industry + tone + images.
 * Fills missing items with sample-like data so the cinematic builder has full content to render.
 */

import type { Prospect } from '$lib/server/prospects';
import type { GbpData, GbpReview } from '$lib/server/gbp';
import type { ToneSlug } from '$lib/tones';
import type { IndustrySlug } from '$lib/industries';
import { industryDisplayToSlug } from '$lib/industries';
import type { LandingPageIndexJson } from '$lib/types/landingPageIndexJson';

function getAreaFromAddress(address: string): string {
	if (!address?.trim()) return '';
	const match = address.match(/,?\s*([A-Za-z\s]+),\s*[A-Z]{2}\s*(?:\d|$)/);
	return match?.[1]?.trim() ?? '';
}

/** Theme colors and style label by tone (aligned with landing-page.md theme.style and presets). */
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

/** Default services by industry (3 items; name, description, price). */
function getDefaultServices(name: string, industryLabel: string, area: string): LandingPageIndexJson['services'] {
	const loc = area ? ` in ${area}` : '';
	const slug = industryDisplayToSlug(industryLabel) as IndustrySlug;
	const defaults: Record<string, LandingPageIndexJson['services']> = {
		healthcare: [
			{ name: 'Consultations', description: `In-person and virtual consultations${loc}. We take time to understand your needs.`, price: '—' },
			{ name: 'Ongoing Care', description: 'Follow-up visits, care plans, and coordination with specialists.', price: '—' },
			{ name: 'Preventive Care', description: 'Check-ups, screenings, and wellness programs to keep you healthy.', price: '—' }
		],
		dental: [
			{ name: 'General Dentistry', description: `Cleanings, exams, and preventive care${loc}.`, price: '—' },
			{ name: 'Restorative Care', description: 'Fillings, crowns, and repairs to restore your smile.', price: '—' },
			{ name: 'Cosmetic & Whitening', description: 'Teeth whitening and cosmetic procedures.', price: 'Contact us' }
		],
		construction: [
			{ name: 'Renovations', description: `Kitchens, bathrooms, and full renovations${loc}.`, price: 'Quote' },
			{ name: 'Repairs & Maintenance', description: 'Repairs and small jobs. No project too small.', price: 'Quote' },
			{ name: 'New Construction', description: 'Additions and new builds from foundation to finish.', price: 'Quote' }
		],
		salons: [
			{ name: 'Hair', description: `Cuts, color, and styling${loc}.`, price: '—' },
			{ name: 'Skin & Nails', description: 'Facials, manicures, pedicures, and treatments.', price: '—' },
			{ name: 'Special Events', description: 'Bridal and event styling. Book in advance.', price: '—' }
		],
		professional: [
			{ name: 'Consulting', description: `Expert advice and strategy${loc}.`, price: '—' },
			{ name: 'Implementation', description: 'Hands-on delivery and project management.', price: '—' },
			{ name: 'Ongoing Support', description: 'Retainers and follow-up to ensure results.', price: '—' }
		],
		'real-estate': [
			{ name: 'Buying', description: `Find your next home${loc}. We guide you through every step.`, price: '—' },
			{ name: 'Selling', description: 'List, market, and sell with confidence.', price: '—' },
			{ name: 'Investments', description: 'Investment properties and portfolio advice.', price: '—' }
		],
		legal: [
			{ name: 'Consultation', description: `Initial review and strategy${loc}.`, price: '—' },
			{ name: 'Representation', description: 'Full representation and advocacy.', price: '—' },
			{ name: 'Document Review', description: 'Contracts, agreements, and legal documents.', price: '—' }
		],
		fitness: [
			{ name: 'Membership', description: `Access to facilities and classes${loc}.`, price: '—' },
			{ name: 'Personal Training', description: 'One-on-one sessions tailored to your goals.', price: '—' },
			{ name: 'Group Classes', description: 'Yoga, HIIT, and specialty classes.', price: '—' }
		]
	};
	return defaults[slug] ?? [
		{ name: 'Our Services', description: `Quality service${loc}. We're here to help.`, price: '—' },
		{ name: 'Consultation', description: 'Get in touch for a quote or to discuss your needs.', price: '—' },
		{ name: 'Ongoing Support', description: 'We stand behind our work.', price: '—' }
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

/** Default stats (4). */
function getDefaultStats(name: string, gbp: GbpData | null): NonNullable<LandingPageIndexJson['stats']> {
	const rating = gbp?.ratingValue ?? 4.9;
	const reviewCount = gbp?.ratingCount ?? 0;
	return [
		{ value: String(reviewCount || '100+'), label: 'Reviews' },
		{ value: String(rating), label: 'Average Rating ★' },
		{ value: 'Local', label: '& Trusted' },
		{ value: '15+', label: 'Years Experience' }
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

/** Unsplash keywords by industry for image fallbacks. */
function getUnsplashKeywords(industryLabel: string): string[] {
	const slug = industryDisplayToSlug(industryLabel) as IndustrySlug;
	const map: Record<string, string[]> = {
		healthcare: ['clinic', 'healthcare', 'medical', 'doctor'],
		dental: ['dental', 'dentist', 'clinic', 'smile'],
		construction: ['construction', 'renovation', 'tools', 'building'],
		salons: ['salon', 'beauty', 'hair', 'spa'],
		professional: ['office', 'business', 'professional', 'meeting'],
		'real-estate': ['real estate', 'house', 'home', 'keys'],
		legal: ['law', 'legal', 'office', 'professional'],
		fitness: ['gym', 'fitness', 'workout', 'exercise']
	};
	return map[slug] ?? [industryLabel.toLowerCase(), 'business', 'local', 'service'];
}

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80';

export type BuildLandingPageIndexJsonInput = {
	prospect: Prospect;
	gbpRaw: GbpData | null;
	industryLabel: string;
	tone: ToneSlug;
	imageUrls: { hero: string; about: string };
};

/**
 * Build full index.json for the landing-page.md prompt.
 * Uses prospect + GBP + industry + tone + image URLs; fills any missing items with sample-like data.
 */
export function buildLandingPageIndexJson(input: BuildLandingPageIndexJsonInput): LandingPageIndexJson {
	const { prospect, gbpRaw, industryLabel, tone, imageUrls } = input;
	const name = gbpRaw?.name || prospect.companyName?.trim() || 'This Business';
	const address = gbpRaw?.address || prospect.address || '';
	const phone = gbpRaw?.phone || prospect.phone || '';
	const email = prospect.email?.trim() || '';
	const website = gbpRaw?.website || prospect.website || '';
	const area = getAreaFromAddress(address);
	const city = prospect.city || area;
	const theme = getThemeForTone(tone);
	const primaryCtaLabel = 'Get in touch';
	const primaryCtaHref = phone ? `tel:${phone.replace(/\s/g, '')}` : '#contact';

	const services = getDefaultServices(name, industryLabel, area);
	const about = getDefaultAbout(name, industryLabel, area);
	const faq = getDefaultFaq(industryLabel, area);
	const process = getDefaultProcess();
	const stats = getDefaultStats(name, gbpRaw ?? null);
	const reviews = gbpRaw?.reviews?.filter((r) => (r.text ?? '').trim().length > 0) ?? [];
	const testimonials =
		reviews.length > 0 ? mapReviewsToTestimonials(reviews, DEFAULT_AVATAR) : getFallbackTestimonials(industryLabel, area, DEFAULT_AVATAR);
	const unsplashKeywords = getUnsplashKeywords(industryLabel);

	// Business hours: try to shape GBP workHours if present; otherwise generic
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

	return {
		business: {
			name,
			tagline: oneLiner,
			description: about.body,
			logo: null,
			phone: phone || undefined,
			email: email || undefined,
			address: address || undefined,
			city: city || undefined,
			hours,
			social: {}
		},
		hero: {
			headline: `${name}. ${industryLabel}${city ? ` in ${city}` : ''}.`,
			subheadline: oneLiner,
			cta: { label: primaryCtaLabel, href: primaryCtaHref },
			image: imageUrls.hero,
			backgroundStyle: 'image'
		},
		services,
		about: {
			...about,
			image: imageUrls.about
		},
		stats,
		testimonials,
		faq,
		process,
		cta_banner: {
			headline: 'Ready to get started?',
			subtext: `Get in touch with ${name} today.`,
			button: { label: primaryCtaLabel, href: primaryCtaHref }
		},
		contact: {
			headline: 'Contact us',
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
		seo: {
			title: `${name} | ${industryLabel}${city ? ` in ${city}` : ''}`,
			description: `${name} — ${oneLiner}`,
			keywords: [industryLabel, name, city, area].filter(Boolean)
		}
	};
}
