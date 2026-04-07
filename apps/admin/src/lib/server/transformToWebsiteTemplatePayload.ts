/**
 * Transform LandingPageIndexJson (built + enriched) into the structured payload
 * expected by Website Template (index.json shape). Handles hours normalization,
 * testimonial shape, and
 * testimonial shape.
 */

import type { Prospect } from '$lib/server/prospects';
import type { GbpData } from '$lib/server/gbp';
import type { LandingPageIndexJson } from '$lib/types/landingPageIndexJson';
import type { WebsiteTemplatePayload } from '$lib/types/websiteTemplatePayload';

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** Expand aggregated keys like "Monday–Friday" to per-day keys. */
function normalizeHoursToDayKeys(hours: Record<string, string>): Record<string, string> {
	const result: Record<string, string> = {};
	const defaultWeekday = '9am–6pm';
	const defaultSat = '10am–4pm';
	const defaultSun = 'Closed';

	for (const day of DAYS_ORDER) {
		if (hours[day] != null && typeof hours[day] === 'string') {
			result[day] = hours[day];
			continue;
		}
		// Check aggregated keys
		if (day !== 'Saturday' && day !== 'Sunday' && (hours['Monday–Friday'] ?? hours['Monday-Friday'])) {
			result[day] = hours['Monday–Friday'] ?? hours['Monday-Friday'] ?? defaultWeekday;
			continue;
		}
		if (day === 'Saturday') {
			result[day] = hours['Saturday'] ?? defaultSat;
			continue;
		}
		if (day === 'Sunday') {
			result[day] = hours['Sunday'] ?? defaultSun;
			continue;
		}
		result[day] = defaultWeekday;
	}
	return result;
}

export type TransformToWebsiteTemplatePayloadInput = {
	indexJson: LandingPageIndexJson;
	prospect: Prospect;
	gbpRaw: GbpData | null;
};

/**
 * Transform built and enriched LandingPageIndexJson into the exact shape
 * Website Template expects (business, hero, images, services, insurance, about,
 * stats, testimonials, contact, theme, seo). Normalizes hours to Monday–Sunday,
 * maps services with price, and maps testimonials to { author, quote, rating }.
 */
export function transformToWebsiteTemplatePayload(input: TransformToWebsiteTemplatePayloadInput): WebsiteTemplatePayload {
	const { indexJson, prospect, gbpRaw } = input;
	const business = indexJson.business ?? {};
	const hoursRaw = business.hours ?? {
		'Monday–Friday': '9am – 6pm',
		Saturday: '10am – 4pm',
		Sunday: 'Closed'
	};
	const hours = normalizeHoursToDayKeys(hoursRaw as Record<string, string>);

	const rawName = business.name ?? gbpRaw?.name ?? prospect.companyName?.trim() ?? 'This Business';
	// Use display name only: strip SEO-style " | ..." suffix so nav/hero show "Hummingbird Dental Clinic" not "Hummingbird Dental Clinic | Dental Care in Richmond Hill"
	const name = typeof rawName === 'string' && rawName.includes(' | ') ? rawName.split(' | ')[0].trim() || rawName : rawName;
	const address = business.address ?? gbpRaw?.address ?? prospect.address ?? '';
	const phone = business.phone ?? gbpRaw?.phone ?? prospect.phone ?? '';
	const email = business.email ?? prospect.email?.trim() ?? '';
	const primaryCtaLabel = 'Get in touch';
	const primaryCtaHref = phone ? `tel:${phone.replace(/\s/g, '')}` : '#contact';

	const hero = indexJson.hero ?? {};
	const images = indexJson.images ?? {};
	const services = indexJson.services ?? [];
	const about = indexJson.about ?? {};
	const stats = indexJson.stats ?? [];
	const testimonials = indexJson.testimonials ?? [];
	const contact = indexJson.contact ?? {};
	const theme = indexJson.theme ?? {};
	const seo = indexJson.seo ?? {};

	const servicesOut = services.slice(0, 6).map((s) => ({
		name: s.name,
		description: s.description ?? '',
		price: s.price ?? '—'
	}));

	// Testimonials: pitch expects { author, quote, rating }
	const testimonialsOut = testimonials.slice(0, 5).map((t) => ({
		author: t.author ?? 'Customer',
		quote: t.quote ?? 'Great experience. Would recommend.',
		rating: typeof t.rating === 'number' && t.rating >= 1 && t.rating <= 5 ? t.rating : 5
	}));

	const payload: WebsiteTemplatePayload = {
		business: {
			name,
			tagline: business.tagline ?? undefined,
			description: business.description ?? undefined,
			phone: phone || undefined,
			email: email || undefined,
			address: address || undefined,
			coordinates: business.coordinates ?? null,
			hours,
			social: business.social && Object.keys(business.social).length > 0 ? business.social : undefined
		},
		hero: {
			headline: hero.headline ?? `${name}. Quality service.`,
			subheadline: hero.subheadline ?? 'Get in touch today.',
			cta: hero.cta ?? { label: primaryCtaLabel, href: primaryCtaHref },
			backgroundStyle: hero.backgroundStyle ?? 'image'
		},
		images: {
			hero: images.hero ?? '',
			about: images.about ?? '',
			unsplashKeywords: images.unsplashKeywords ?? []
		},
		services: servicesOut,
		about: {
			headline: about.headline ?? `${name}`,
			body: about.body ?? `${name} provides quality service. We focus on your satisfaction.`,
			values: about.values?.length ? about.values : ['Quality', 'Trust', 'Local', 'Service']
		},
		stats: stats.length ? stats.slice(0, 6) : [
			{ value: '100+', label: 'Reviews' },
			{ value: '4.9', label: 'Average Rating ★' },
			{ value: '15+', label: 'Years Experience' },
			{ value: '500+', label: 'Happy Clients' }
		],
		gallery: images.gallery && images.gallery.length > 0 ? images.gallery : [],
		testimonials: testimonialsOut.length ? testimonialsOut : [
			{ author: 'Sarah M.', quote: 'Professional and reliable. Would recommend.', rating: 5 },
			{ author: 'James K.', quote: 'Great experience from start to finish.', rating: 5 }
		],
		contact: {
			headline: contact.headline ?? 'Contact us',
			showForm: contact.showForm !== false,
			showMap: !!address,
			mapEmbed: contact.mapEmbed ?? null,
			googleMapsApiKey: contact.googleMapsApiKey ?? null
		},
		theme: {
			style: theme.style ?? 'modern',
			primaryColor: theme.primaryColor ?? '#0f172a',
			accentColor: theme.accentColor ?? '#0369a1'
		},
		seo: {
			title: seo.title ?? `${name} | Quality Service`,
			description: seo.description ?? `${name} — quality service and customer focus. Get in touch today.`,
			keywords: seo.keywords?.length ? seo.keywords : [name, 'contact', 'service']
		}
	};

	return payload;
}
