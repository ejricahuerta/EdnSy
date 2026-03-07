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

type ConstructionTradeDefaults = Partial<{
	meta: { title: string; description: string };
	hero: { headline: string; subheadline: string; body: string; imageUrl: string; imageAlt: string };
	problem: { headline: string; items: string[] };
	solution: { headline: string; body: string; imageUrl: string; imageAlt: string };
	services: { headline: string; subheadline: string; items: typeof DEFAULT_SERVICES };
	stats: { items: Array<{ value: string; label: string }> };
	testimonials: { items: Array<{ name: string; location: string; rating: number; text: string }> };
	faq: { items: Array<{ question: string; answer: string }> };
	cta: { headline: string; body: string };
}>;

/** Detect trade from prospect industry display (e.g. "Plumbing" -> plumbing, "Locksmith" -> locksmith). */
function getConstructionTradeFromIndustry(industryDisplay: string | null | undefined): 'plumbing' | 'locksmith' | 'construction' {
	const raw = (industryDisplay ?? '').toLowerCase().trim();
	if (/\bplumb(er|ing)?s?\b/.test(raw)) return 'plumbing';
	if (/\blocksmith(s)?\b/.test(raw)) return 'locksmith';
	return 'construction';
}

/** Industry-specific fallback copy for trades (construction: plumbing, locksmith, or generic). */
function getConstructionTradeDefaults(name: string, area: string, industryDisplay?: string | null): ConstructionTradeDefaults {
	const location = area ? ` in ${area}` : '';
	const trade = getConstructionTradeFromIndustry(industryDisplay);

	if (trade === 'plumbing') {
		return {
			meta: {
				title: `${name} — Plumbing${location}`,
				description: `Licensed plumbing services${location}. Repairs, installations, 24/7 emergency service.`
			},
			hero: {
				headline: `Plumbing you can count on.`,
				subheadline: 'Repairs • Installations • 24/7 emergency • Licensed and insured.',
				body: `${name} provides plumbing repairs, installations, and emergency service${location}. We show up on time and get the job done right.`,
				imageUrl: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=1200&q=80',
				imageAlt: 'Professional plumber at work'
			},
			problem: {
				headline: 'Need a plumber?',
				items: [
					'Leaks, clogged drains, or broken fixtures',
					'Water heater or pipe installation and repair',
					'You want a licensed, reliable plumber — not a handyman'
				]
			},
			solution: {
				headline: "Here's how we help",
				body: `We offer upfront pricing and clear communication. Our technicians are licensed and insured. From emergency repairs to new installations, we get it done right.`,
				imageUrl: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80',
				imageAlt: `${name} — plumbing services`
			},
			services: {
				headline: 'Our Services',
				subheadline: 'Residential and commercial plumbing.',
				items: [
					{ icon: 'wrench', title: 'Emergency Repairs', description: '24/7 response for leaks, burst pipes, and no-heat calls. We get there fast.', cta: { label: 'Learn More', href: '#contact' } },
					{ icon: 'wrench', title: 'Drains & Fixtures', description: 'Clogged drains, faucet and toilet repairs, and fixture installation.', cta: { label: 'Learn More', href: '#contact' } },
					{ icon: 'wrench', title: 'Installations', description: 'Water heaters, pipe work, and plumbing for renovations and new builds.', cta: { label: 'Contact Us', href: '#contact' } }
				]
			},
			stats: {
				items: [
					{ value: '24/7', label: 'Emergency Service' },
					{ value: '15+', label: 'Years Experience' },
					{ value: '500+', label: 'Happy Clients' }
				]
			},
			testimonials: {
				items: [
					{ name: 'Sarah M.', location: area || 'Local', rating: 5, text: 'Had a burst pipe on a Sunday. They came out within an hour and fixed it. Fair price.' },
					{ name: 'James K.', location: area || 'GTA', rating: 5, text: 'Replaced our water heater. Clear quote, done on time. Would recommend.' }
				]
			},
			faq: {
				items: [
					{ question: 'Do you offer emergency plumbing service?', answer: 'Yes. We offer 24/7 emergency plumbing. Call us anytime.' },
					{ question: 'What areas do you serve?', answer: `We serve ${area || 'the local area'} and surrounding communities.` },
					{ question: 'Are you licensed and insured?', answer: 'Yes. We are licensed and insured for your protection.' }
				]
			},
			cta: {
				headline: 'Need a plumber?',
				body: 'Call for emergency service or request a quote. We respond quickly.'
			}
		};
	}

	if (trade === 'locksmith') {
		return {
			meta: {
				title: `${name} — Locks & Security${location}`,
				description: `Professional locksmith and security services${location}. 24/7 emergency lockout, rekeying, and commercial locks.`
			},
			hero: {
				headline: `Locks and security you can count on.`,
				subheadline: '24/7 emergency lockout • Residential & commercial • Licensed and insured.',
				body: `${name} provides locksmith services, lock repairs, rekeying, and security upgrades${location}. Fast response when you need it.`,
				imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
				imageAlt: 'Professional locksmith at work'
			},
			problem: {
				headline: 'Need a locksmith?',
				items: [
					'Locked out of your home, car, or office',
					'Need new locks, rekeying, or a security upgrade',
					'You want a licensed, reliable pro — not a fly-by-night'
				]
			},
			solution: {
				headline: "Here's how we help",
				body: `We offer upfront pricing and clear communication. Our technicians are trained and insured. Whether it's an emergency lockout or a planned lock change, we get the job done right.`,
				imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80',
				imageAlt: `${name} — locksmith and security`
			},
			services: {
				headline: 'Our Services',
				subheadline: 'Residential, commercial, and emergency.',
				items: [
					{ icon: 'wrench', title: 'Emergency Lockout', description: '24/7 response for lockouts. We get you back in quickly and safely.', cta: { label: 'Learn More', href: '#contact' } },
					{ icon: 'wrench', title: 'Residential & Commercial', description: 'New locks, rekeying, and lock repairs for homes and businesses.', cta: { label: 'Learn More', href: '#contact' } },
					{ icon: 'wrench', title: 'Keys & Security', description: 'Key duplication, high-security locks, and security assessments.', cta: { label: 'Contact Us', href: '#contact' } }
				]
			},
			stats: {
				items: [
					{ value: '24/7', label: 'Emergency Service' },
					{ value: '15+', label: 'Years Experience' },
					{ value: '500+', label: 'Happy Clients' }
				]
			},
			testimonials: {
				items: [
					{ name: 'Sarah M.', location: area || 'Local', rating: 5, text: 'Called after being locked out. They showed up fast and were professional. Fair price.' },
					{ name: 'James K.', location: area || 'GTA', rating: 5, text: 'Had the whole house rekeyed. Clear quote, done on time. Would use again.' }
				]
			},
			faq: {
				items: [
					{ question: 'Do you offer emergency lockout service?', answer: 'Yes. We offer 24/7 emergency lockout service. Call us anytime.' },
					{ question: 'What areas do you serve?', answer: `We serve ${area || 'the local area'} and surrounding communities.` },
					{ question: 'Are you licensed and insured?', answer: 'Yes. We are licensed and insured for your protection.' }
				]
			},
			cta: {
				headline: 'Need a locksmith?',
				body: 'Call for emergency service or request a quote. We respond quickly.'
			}
		};
	}

	// Generic construction / contractor
	return {
		meta: {
			title: `${name} — Construction & Renovation${location}`,
			description: `Quality construction and renovation services${location}. Renovations, repairs, and new builds.`
		},
		hero: {
			headline: `Quality construction in your community.`,
			subheadline: 'Renovations • Repairs • New construction • Licensed and insured.',
			body: `${name} delivers construction and renovation services${location}. From small repairs to full renovations, we show up and get the job done right.`,
			imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80',
			imageAlt: 'Construction and renovation'
		},
		problem: {
			headline: 'Looking for a reliable contractor?',
			items: [
				'You need repairs, renovations, or new construction',
				'You want clear quotes and on-time completion',
				'You value quality work and good communication'
			]
		},
		solution: {
			headline: "Here's how we help",
			body: `We offer upfront pricing and clear communication. Our team is licensed and insured. From small repairs to large renovations, we get it done right.`,
			imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80',
			imageAlt: `${name} — construction and renovation`
		},
		services: {
			headline: 'Our Services',
			subheadline: 'Residential and commercial.',
			items: [
				{ icon: 'wrench', title: 'Renovations', description: 'Kitchens, bathrooms, and full home renovations. We handle the whole project.', cta: { label: 'Learn More', href: '#contact' } },
				{ icon: 'wrench', title: 'Repairs & Maintenance', description: 'Repairs, maintenance, and small jobs. No project too small.', cta: { label: 'Learn More', href: '#contact' } },
				{ icon: 'wrench', title: 'New Construction', description: 'Additions and new builds. From foundation to finish.', cta: { label: 'Contact Us', href: '#contact' } }
			]
		},
		stats: {
			items: [
				{ value: '100+', label: 'Projects Done' },
				{ value: '15+', label: 'Years Experience' },
				{ value: '500+', label: 'Happy Clients' }
			]
		},
		testimonials: {
			items: [
				{ name: 'Sarah M.', location: area || 'Local', rating: 5, text: 'Had our kitchen renovated. They were on time, on budget, and the quality was great.' },
				{ name: 'James K.', location: area || 'GTA', rating: 5, text: 'Needed a bathroom repair. Quick quote, done properly. Will use again.' }
			]
		},
		faq: {
			items: [
				{ question: 'Do you do small jobs?', answer: 'Yes. We take on everything from small repairs to large renovations. No project is too small for a professional quote.' },
				{ question: 'What areas do you serve?', answer: `We serve ${area || 'the local area'} and surrounding communities.` },
				{ question: 'Are you licensed and insured?', answer: 'Yes. We are licensed and insured for your protection.' }
			]
		},
		cta: {
			headline: 'Ready to get started?',
			body: 'Request a quote or give us a call. We respond quickly.'
		}
	};
}

/** Derive a short area name from address (e.g. "Concord", "North York") for copy. */
function getAreaFromAddress(address: string): string {
	if (!address?.trim()) return '';
	const match = address.match(/,?\s*([A-Za-z\s]+),\s*[A-Z]{2}\s*(?:\d|$)/);
	return match?.[1]?.trim() ?? '';
}

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

/** Industry-specific fallback review templates: 2 short testimonials based on business type. */
const FALLBACK_BY_INDUSTRY: Record<string, Array<{ name: string; location: string; text: string }>> = {
	healthcare: [
		{ name: 'Sarah M.', location: 'Local', text: 'Professional and caring. They took time to answer all my questions. Highly recommend.' },
		{ name: 'James K.', location: 'Downtown', text: 'Clean office, friendly staff, and I was in and out without a long wait. Great experience.' }
	],
	dental: [
		{ name: 'Priya M.', location: 'East Side', text: 'Best dental visit I\'ve had. Gentle and thorough. My whole family comes here now.' },
		{ name: 'David R.', location: 'Local', text: 'Fixed my issue quickly and explained everything. The team is kind and very professional.' }
	],
	construction: [
		{ name: 'Mike T.', location: 'Local', text: 'Showed up on time, gave a fair quote, and did quality work. Will use again.' },
		{ name: 'Lisa W.', location: 'GTA', text: 'Professional from start to finish. Clear communication and the job was done right.' }
	],
	salons: [
		{ name: 'Emma L.', location: 'Downtown', text: 'Love this place. Always leave feeling refreshed and looking great. Staff is amazing.' },
		{ name: 'Alex P.', location: 'Local', text: 'Consistent quality every visit. They listen to what you want and deliver. Highly recommend.' }
	],
	professional: [
		{ name: 'Chris N.', location: 'Local', text: 'Knowledgeable and responsive. They delivered exactly what we needed on time.' },
		{ name: 'Jordan S.', location: 'Downtown', text: 'Professional and easy to work with. Would definitely use their services again.' }
	],
	'real-estate': [
		{ name: 'Sam and Jess', location: 'Local', text: 'Made buying our first home smooth and stress-free. Great communication throughout.' },
		{ name: 'Maria G.', location: 'Downtown', text: 'Sold our condo in no time. They know the market and got us a fair price.' }
	],
	legal: [
		{ name: 'Robert H.', location: 'Local', text: 'Clear advice and handled my case with care. I felt informed every step of the way.' },
		{ name: 'Jennifer L.', location: 'Downtown', text: 'Professional and straightforward. They got the outcome I needed. Thank you.' }
	],
	fitness: [
		{ name: 'Tom B.', location: 'Local', text: 'Best gym in the area. Clean, great equipment, and the trainers actually know their stuff.' },
		{ name: 'Nina K.', location: 'Downtown', text: 'Motivating environment and supportive staff. I\'ve seen real results since joining.' }
	]
};

const GENERIC_FALLBACK: Array<{ name: string; location: string; text: string }> = [
	{ name: 'Happy Customer', location: 'Local', text: 'Professional and reliable. Would recommend to anyone.' },
	{ name: 'Satisfied Client', location: 'Downtown', text: 'Great experience from start to finish. Highly recommend.' }
];

/** Return 2 testimonial items (name, location, rating, text) tailored to industry; add avatarUrl when rendering. */
export function getFallbackTestimonialsForBusiness(
	prospect: Prospect,
	industrySlug?: string
): Array<Omit<TestimonialItem, 'avatarUrl'>> {
	const name = prospect.companyName?.trim() || 'They';
	const templates =
		industrySlug && FALLBACK_BY_INDUSTRY[industrySlug]
			? FALLBACK_BY_INDUSTRY[industrySlug]
			: GENERIC_FALLBACK;
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
	const area = getAreaFromAddress(address);

	const industryDefaults =
		industrySlug === 'construction' ? getConstructionTradeDefaults(name, area, prospect.industry) : null;

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
		: (industryDefaults?.services?.items ?? DEFAULT_SERVICES);

	const primaryCtaLabel = hero?.ctaPrimary ?? cta?.button ?? (industryDefaults ? 'Call Now' : 'Get in touch');
	const primaryCtaHref = phone ? `tel:${phone.replace(/\s/g, '')}` : '#contact';

	const metaTitle = industryDefaults?.meta?.title ?? `${name} — Professional Services`;
	const metaDesc = hero?.subtext?.slice(0, 160) ?? industryDefaults?.meta?.description ?? `${name}. Quality service and care.`;
	const heroHeadline = hero?.headline ?? industryDefaults?.hero?.headline ?? name;
	const heroSubheadline = hero?.subheadline ?? industryDefaults?.hero?.subheadline ?? 'Quality service you can trust.';
	const heroBody = hero?.subtext ?? industryDefaults?.hero?.body ?? `Welcome to ${name}. We're here to help.`;
	const heroImageUrl = hero?.imageUrl ?? industryDefaults?.hero?.imageUrl ?? 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80';
	const heroImageAlt = hero?.imageAlt ?? industryDefaults?.hero?.imageAlt ?? name;

	const problemHeadline = industryDefaults?.problem?.headline ?? 'Looking for quality service?';
	const problemItems = industryDefaults?.problem?.items ?? [
		'You want a team you can trust',
		'You need reliable, professional results',
		'You value clear communication and fair pricing'
	];

	const solutionHeadline = industryDefaults?.solution?.headline ?? "We're here to help";
	const solutionBody =
		landingContent?.cta?.subtext ??
		industryDefaults?.solution?.body ??
		`At ${name}, we focus on what matters: quality work, clear communication, and your satisfaction.`;
	const solutionImageUrl =
		landingContent?.aboutImageUrl ?? industryDefaults?.solution?.imageUrl ?? 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80';
	const solutionImageAlt = landingContent?.aboutImageAlt ?? industryDefaults?.solution?.imageAlt ?? `${name} team`;

	const servicesHeadline = industryDefaults?.services?.headline ?? 'What We Offer';
	const servicesSubheadline = industryDefaults?.services?.subheadline ?? 'Services tailored to your needs.';

	const statsItems = industryDefaults?.stats?.items ?? [
		{ value: '100+', label: 'Happy Clients' },
		{ value: '15+', label: 'Years Experience' },
		{ value: '500+', label: 'Happy Clients' }
	];

	const testimonialFallbacks = industryDefaults?.testimonials?.items?.map((t) => ({
		...t,
		avatarUrl: DEFAULT_TESTIMONIAL_AVATAR
	}));
	const faqItems = industryDefaults?.faq?.items ?? [
		{ question: 'How can I get started?', answer: 'Reach out via the form above or give us a call. We\'ll respond quickly.' },
		{ question: 'What areas do you serve?', answer: 'We serve our local community and surrounding areas.' }
	];
	const ctaHeadline = industryDefaults?.cta?.headline ?? cta?.heading ?? "Let's connect";
	const ctaBody = industryDefaults?.cta?.body ?? cta?.subtext ?? `Get in touch with ${name} today.`;

	return {
		meta: {
			title: metaTitle,
			description: metaDesc,
			language: 'en'
		},
		tone: { name: 'Professional', copyVoice: 'Clear, trustworthy, action-oriented' },
		brand: {
			logoUrl: landingContent?.logoUrl ?? '/images/logo.png',
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
			items: industryDefaults
				? [
						{ icon: 'clock', label: '24/7 Emergency Service' },
						{ icon: 'shield', label: 'Licensed & Insured' },
						{ icon: 'star', label: 'Rated by our clients' }
					]
				: [
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
			logoUrl: '/images/logo.png',
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
