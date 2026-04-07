/**
 * Build v1.3 page.json for a demo from prospect + scraped data (landingContent or AI full content).
 * Used by /demo/[slug] to render theme-driven demos.
 */

import type { Prospect } from '$lib/server/prospects';
import type { DemoLandingContent } from '$lib/types/demo';
import type { DemoPageJson } from '$lib/types/demoPageJson';
import type { DemoPageContentFromAi } from '$lib/types/demoPageContentFromAi';
import type { V13Theme } from '$lib/demoThemes';
import { getLayoutForTheme } from '$lib/demoThemes';
import type { IndustrySlug } from '$lib/industries';

export type DemoImageUrlsResolved = {
	hero: string;
	solution: string;
	testimonialAvatar: string;
	/** Resolved image URLs for work section items (same order as aiContent.work.items). */
	work?: string[];
};

/** Default copy when no landingContent – generic. */
const DEFAULT_SERVICES = [
	{ icon: 'heart', title: 'Our Services', description: 'Quality care and attention to detail.', cta: { label: 'Learn More', href: '#contact' } },
	{ icon: 'users', title: 'Expert Team', description: 'Experienced professionals you can trust.', cta: { label: 'Learn More', href: '#contact' } },
	{ icon: 'calendar', title: 'Get in Touch', description: 'Book a consultation or request a quote.', cta: { label: 'Contact Us', href: '#contact' } }
];

const MIN_STATS = 3;
const STATS_POOL: Array<{ value: string; label: string }> = [
	{ value: '100+', label: 'Happy Clients' },
	{ value: '15+', label: 'Years Experience' },
	{ value: '500+', label: 'Projects Done' },
	{ value: '24/7', label: 'Support' },
	{ value: '4.9', label: 'Average Rating ★' }
];

/** Placeholder stats we never show in demos; replace with plausible values. */
function isPlaceholderStat(s: { value: string; label: string }): boolean {
	return s.value === '0' || (s.value === 'Local' && s.label === '& Trusted');
}

/** Ensure at least MIN_STATS KPI items; strip placeholders (0, Local & Trusted) and pad with non-duplicate defaults when missing. */
function ensureMinStats(items: Array<{ value: string; label: string }>): Array<{ value: string; label: string }> {
	const cleaned = (items ?? []).filter((s) => !isPlaceholderStat(s));
	if (!cleaned.length) return STATS_POOL.slice(0, MIN_STATS);
	if (cleaned.length >= MIN_STATS) return cleaned;
	const need = MIN_STATS - cleaned.length;
	const used = new Set(cleaned.map((s) => `${s.value}|${s.label}`));
	const toAdd = STATS_POOL.filter((s) => !used.has(`${s.value}|${s.label}`)).slice(0, need);
	return [...cleaned, ...toAdd];
}

const MIN_TESTIMONIALS = 2;
const DEFAULT_TESTIMONIAL_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80';
type TestimonialItem = { name: string; location: string; rating: number; text: string; avatarUrl: string };
const TESTIMONIALS_POOL: Array<Omit<TestimonialItem, 'avatarUrl'>> = [
	{ name: 'Client', location: '', rating: 5, text: 'Professional and reliable. Would recommend.' },
	{ name: 'Happy Customer', location: 'Local', rating: 5, text: 'Great experience from start to finish. Highly recommend.' }
];

/** Ensure at least MIN_TESTIMONIALS review items; pad with pool when missing. */
function ensureMinTestimonials(items: TestimonialItem[], avatarUrl: string): TestimonialItem[] {
	if (!items?.length) return TESTIMONIALS_POOL.slice(0, MIN_TESTIMONIALS).map((t) => ({ ...t, avatarUrl }));
	if (items.length >= MIN_TESTIMONIALS) return items;
	const need = MIN_TESTIMONIALS - items.length;
	const usedTexts = new Set(items.map((i) => i.text));
	const toAdd = TESTIMONIALS_POOL.filter((t) => !usedTexts.has(t.text))
		.slice(0, need)
		.map((t) => ({ ...t, avatarUrl }));
	return [...items, ...toAdd];
}

/** Minimal shape for a review from GBP or stored scraped data. */
export type ReviewLike = { text: string; rating?: number };

const MAX_REAL_REVIEWS = 5;

/** Map GBP-style reviews to testimonial items (name/location generic for privacy). */
export function mapGbpReviewsToTestimonials(
	reviews: ReviewLike[],
	avatarUrl: string = DEFAULT_TESTIMONIAL_AVATAR
): TestimonialItem[] {
	return reviews.slice(0, MAX_REAL_REVIEWS).map((r, i) => ({
		name: 'Google Reviewer',
		location: 'Google',
		rating: typeof r.rating === 'number' && r.rating >= 1 && r.rating <= 5 ? r.rating : 5,
		text: (r.text || '').trim() || 'Great experience. Would recommend.',
		avatarUrl
	}));
}

const DENTAL_FALLBACK_TESTIMONIALS: Array<{ name: string; location: string; text: string }> = [
	{ name: 'Priya M.', location: 'East Side', text: 'Best dental visit I\'ve had. Gentle and thorough. My whole family comes here now.' },
	{ name: 'David R.', location: 'Local', text: 'Fixed my issue quickly and explained everything. The team is kind and very professional.' }
];

/** Return 2 testimonial items (name, location, rating, text) tailored to industry; add avatarUrl when rendering. */
export function getFallbackTestimonialsForBusiness(
	prospect: Prospect,
	_industrySlug?: string
): Array<Omit<TestimonialItem, 'avatarUrl'>> {
	const name = prospect.companyName?.trim() || 'They';
	const templates = DENTAL_FALLBACK_TESTIMONIALS;
	return templates.slice(0, MIN_TESTIMONIALS).map((t) => ({
		name: t.name,
		location: t.location,
		rating: 5,
		text: t.text
	}));
}

/** Apply real GBP reviews to pageJson.testimonials if available; otherwise ensure at least 2 fallback testimonials by industry. */
export function applyReviewsToDemoPageJson(
	pageJson: DemoPageJson,
	prospect: Prospect,
	industrySlug: string,
	gbpRaw?: { reviews?: ReviewLike[] } | null
): void {
	const avatarUrl = DEFAULT_TESTIMONIAL_AVATAR;
	const reviews = gbpRaw?.reviews?.filter((r) => (r.text ?? '').trim().length > 0) ?? [];

	if (reviews.length > 0) {
		const items = mapGbpReviewsToTestimonials(reviews, avatarUrl);
		pageJson.testimonials = {
			...pageJson.testimonials,
			enabled: true,
			source: 'Google reviews',
			items
		};
		return;
	}

	if (!pageJson.testimonials.items?.length || pageJson.testimonials.items.length < MIN_TESTIMONIALS) {
		const fallback = getFallbackTestimonialsForBusiness(prospect, industrySlug).map((t) => ({
			...t,
			avatarUrl
		}));
		pageJson.testimonials = {
			...pageJson.testimonials,
			enabled: true,
			source: pageJson.testimonials.source || 'Reviews',
			items: fallback
		};
	}
}

export function buildDemoPageJson(
	prospect: Prospect,
	layoutType: string,
	landingContent?: DemoLandingContent | null,
	industrySlug?: IndustrySlug | string
): DemoPageJson {
	const name = prospect.companyName?.trim() || 'Your Business';
	const phone = prospect.phone?.trim() || '';
	const address = prospect.address?.trim() || '';
	const email = '';
	const hero = landingContent?.hero;
	const cta = landingContent?.cta;
	const hasLandingServices = landingContent?.services?.length;
	const services = hasLandingServices
		? landingContent.services!.slice(0, 5).map((s) => ({
				icon: (s.icon ?? 'heart') as string,
				title: s.title ?? 'Service',
				description: s.description ?? '',
				cta: { label: 'Learn More', href: '#contact' }
			}))
		: DEFAULT_SERVICES;

	const primaryCtaLabel = hero?.ctaPrimary ?? cta?.button ?? 'Get in touch';
	const primaryCtaHref = phone ? `tel:${phone.replace(/\s/g, '')}` : '#contact';

	const metaTitle = `${name} — Professional Services`;
	const metaDesc = hero?.subtext?.slice(0, 160) ?? `${name}. Quality service and care.`;
	const heroHeadline = hero?.headline ?? name;
	const heroSubheadline = hero?.subheadline ?? 'Quality service you can trust.';
	const heroBody = hero?.subtext ?? `Welcome to ${name}. We're here to help.`;
	const heroImageUrl =
		hero?.imageUrl ?? 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80';
	const heroImageAlt = hero?.imageAlt ?? name;

	const problemHeadline = 'Looking for quality service?';
	const problemItems = [
		'You want a team you can trust',
		'You need reliable, professional results',
		'You value clear communication and fair pricing'
	];

	const solutionHeadline = "We're here to help";
	const solutionBody =
		landingContent?.cta?.subtext ??
		`At ${name}, we focus on what matters: quality work, clear communication, and your satisfaction.`;
	const solutionImageUrl =
		landingContent?.aboutImageUrl ??
		'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80';
	const solutionImageAlt = landingContent?.aboutImageAlt ?? `${name} team`;

	const servicesHeadline = 'What We Offer';
	const servicesSubheadline = 'Services tailored to your needs.';

	const statsItems = [
		{ value: '100+', label: 'Happy Clients' },
		{ value: '15+', label: 'Years Experience' },
		{ value: '500+', label: 'Happy Clients' }
	];

	const testimonialFallbacks: TestimonialItem[] | undefined = undefined;
	const faqItems = [
		{
			question: 'How can I get started?',
			answer: "Reach out via the form above or give us a call. We'll respond quickly."
		},
		{
			question: 'What areas do you serve?',
			answer: 'We serve our local community and surrounding areas.'
		}
	];
	const ctaHeadline = cta?.heading ?? "Let's connect";
	const ctaBody = cta?.subtext ?? `Get in touch with ${name} today.`;

	return {
		meta: {
			title: metaTitle,
			description: metaDesc,
			language: 'en'
		},
		tone: { name: 'Professional', copyVoice: 'Clear, trustworthy, action-oriented' },
		brand: {
			logoUrl: landingContent?.logoUrl ?? '/logo/logo.png',
			logoAlt: name,
			businessName: name
		},
		nav: {
			links: [
				{ label: 'Services', href: '#services' },
				{ label: 'Reviews', href: '#reviews' },
				{ label: 'Contact', href: '#contact' }
			],
			cta: { label: primaryCtaLabel, href: primaryCtaHref }
		},
		hero: {
			type: layoutType,
			headline: heroHeadline,
			subheadline: heroSubheadline,
			body: heroBody,
			primaryCta: { label: primaryCtaLabel, href: primaryCtaHref },
			secondaryCta: { label: 'Our Services', href: '#services' },
			imageUrl: heroImageUrl,
			imageAlt: heroImageAlt
		},
		trustBar: {
			enabled: true,
			items: [
				{ icon: 'star', label: 'Rated by our clients' },
				{ icon: 'shield', label: 'Trusted local business' },
				{ icon: 'clock', label: 'Responsive service' }
			]
		},
		problem: {
			enabled: true,
			headline: problemHeadline,
			items: problemItems
		},
		solution: {
			enabled: true,
			headline: solutionHeadline,
			body: solutionBody,
			imageUrl: solutionImageUrl,
			imageAlt: solutionImageAlt
		},
		services: {
			enabled: true,
			headline: servicesHeadline,
			subheadline: servicesSubheadline,
			items: services as DemoPageJson['services']['items']
		},
		features: {
			enabled: false,
			headline: '',
			subheadline: '',
			items: []
		},
		stats: {
			enabled: true,
			items: ensureMinStats(statsItems)
		},
		testimonials: {
			enabled: true,
			headline: 'What Clients Say',
			source: 'Reviews',
			items: ensureMinTestimonials(
				testimonialFallbacks ?? [],
				DEFAULT_TESTIMONIAL_AVATAR
			)
		},
		cta: {
			enabled: true,
			headline: ctaHeadline,
			body: ctaBody,
			primaryCta: { label: cta?.button ?? primaryCtaLabel, href: primaryCtaHref },
			secondaryCta: { label: 'Our Services', href: '#services' },
			guarantee: cta?.microReassurance ?? undefined
		},
		contact: {
			enabled: true,
			headline: 'Get in Touch',
			subheadline: 'We respond within 24 hours.',
			fields: ['name', 'email', 'phone', 'message'],
			submitLabel: 'Send Message',
			phone: phone || '—',
			email: email || '—',
			address: address || '—',
			mapEmbedUrl: ''
		},
		faq: {
			enabled: true,
			headline: 'Frequently Asked Questions',
			items: faqItems
		},
		footer: {
			tagline: name,
			hours: [{ days: 'Mon – Fri', hours: '9am – 5pm' }],
			socialLinks: [],
			legalLinks: [
				{ label: 'Privacy', href: '/privacy' },
				{ label: 'Terms', href: '/terms' },
				{ label: 'Cookies', href: '/cookies' }
			],
			copyright: `© ${new Date().getFullYear()} ${name}. All rights reserved.`
		},
		banner: { enabled: false, text: '', cta: null, type: 'info' }
	};
}

export function buildDemoPageJsonForTheme(
	prospect: Prospect,
	theme: V13Theme,
	landingContent?: DemoLandingContent | null,
	industrySlug?: IndustrySlug | string
): DemoPageJson {
	const layoutType = getLayoutForTheme(theme);
	return buildDemoPageJson(prospect, layoutType, landingContent, industrySlug);
}

/**
 * Build full DemoPageJson from AI-generated content (GBP + insight) and resolved image URLs.
 * Used when we have stored demoPageJson from create-demo; layoutType from theme.
 */
export function buildDemoPageJsonFromAiContent(
	prospect: Prospect,
	aiContent: DemoPageContentFromAi,
	layoutType: string,
	imageUrls: DemoImageUrlsResolved
): DemoPageJson {
	const name = prospect.companyName?.trim() || aiContent.meta.title.split('—')[0]?.trim() || 'Your Business';
	const phone = prospect.phone?.trim() || '';
	const primaryCtaHref = phone ? `tel:${phone.replace(/\s/g, '')}` : '#contact';

	return {
		meta: {
			title: aiContent.meta.title,
			description: aiContent.meta.description,
			language: 'en'
		},
		tone: aiContent.tone,
		brand: {
			logoUrl: '/logo/logo.png',
			logoAlt: name,
			businessName: name
		},
		nav: {
			links:
				aiContent.work?.items?.length && imageUrls.work?.length
					? [
							...aiContent.nav.links.filter((l) => (l.href || '').toLowerCase() !== '#work'),
							{ label: 'Our Work', href: '#work' }
						]
					: aiContent.nav.links,
			cta: { label: aiContent.nav.ctaLabel, href: primaryCtaHref }
		},
		hero: {
			type: layoutType,
			headline: aiContent.hero.headline,
			subheadline: aiContent.hero.subheadline,
			body: aiContent.hero.body,
			primaryCta: { label: aiContent.hero.primaryCta, href: primaryCtaHref },
			secondaryCta: { label: aiContent.hero.secondaryCta, href: '#services' },
			imageUrl: imageUrls.hero,
			imageAlt: aiContent.hero.heroImageAlt
		},
		trustBar: {
			enabled: true,
			items: aiContent.trustBar.items
		},
		problem: {
			enabled: true,
			headline: aiContent.problem.headline,
			items: aiContent.problem.items
		},
		solution: {
			enabled: true,
			headline: aiContent.solution.headline,
			body: aiContent.solution.body,
			imageUrl: imageUrls.solution,
			imageAlt: aiContent.solution.solutionImageAlt
		},
		services: {
			enabled: true,
			headline: aiContent.services.headline,
			subheadline: aiContent.services.subheadline,
			items: aiContent.services.items.map((s) => ({
				icon: s.icon,
				title: s.title,
				description: s.description,
				cta: { label: s.ctaLabel, href: '#contact' }
			}))
		},
		features: {
			enabled: false,
			headline: '',
			subheadline: '',
			items: []
		},
		...(aiContent.work?.items?.length && imageUrls.work?.length
			? {
					work: {
						enabled: true,
						headline: aiContent.work.headline,
						subheadline: aiContent.work.subheadline,
						items: aiContent.work.items.map((item, i) => ({
							title: item.title,
							description: item.description,
							imageUrl: imageUrls.work![i] ?? imageUrls.solution,
							imageAlt: item.imageAlt,
							category: item.category,
							outcome: item.outcome
						}))
					}
				}
			: {}),
		stats: {
			enabled: true,
			items: ensureMinStats(aiContent.stats?.items ?? [])
		},
		testimonials: {
			enabled: true,
			headline: aiContent.testimonials.headline,
			source: aiContent.testimonials.source,
			items: ensureMinTestimonials(
				aiContent.testimonials.items.map((t) => ({
					name: t.name,
					location: t.location,
					rating: t.rating,
					text: t.text,
					avatarUrl: imageUrls.testimonialAvatar
				})),
				imageUrls.testimonialAvatar
			)
		},
		cta: {
			enabled: true,
			headline: aiContent.cta.headline,
			body: aiContent.cta.body,
			primaryCta: { label: aiContent.cta.primaryCta, href: primaryCtaHref },
			secondaryCta: { label: aiContent.cta.secondaryCta, href: '#services' },
			guarantee: aiContent.cta.guarantee ?? undefined
		},
		contact: {
			enabled: true,
			headline: 'Get in Touch',
			subheadline: 'We respond within 24 hours.',
			fields: ['name', 'email', 'phone', 'message'],
			submitLabel: 'Send Message',
			phone: phone || '—',
			email: '—',
			address: prospect.address?.trim() || '—',
			mapEmbedUrl: ''
		},
		faq: {
			enabled: true,
			headline: aiContent.faq.headline,
			items: aiContent.faq.items
		},
		footer: {
			tagline: aiContent.footer.tagline,
			hours:
				(aiContent.footer.hours?.length ?? 0) > 0
					? aiContent.footer.hours!
					: [{ days: 'Mon – Fri', hours: '9am – 5pm' }],
			socialLinks: [],
			legalLinks: [
				{ label: 'Privacy', href: '/privacy' },
				{ label: 'Terms', href: '/terms' },
				{ label: 'Cookies', href: '/cookies' }
			],
			copyright: aiContent.footer.copyright
		},
		banner: { enabled: false, text: '', cta: null, type: 'info' }
	};
}
