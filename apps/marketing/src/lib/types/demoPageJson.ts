/**
 * v1.3 style-guide page.json shape for demo landing pages.
 * Used by /demo/[slug] to render theme-driven demos.
 */

export type DemoPageJson = {
	meta: {
		title: string;
		description: string;
		language: string;
	};
	tone: { name: string; copyVoice: string };
	brand: {
		logoUrl: string;
		logoAlt: string;
		businessName: string;
	};
	nav: {
		links: Array<{ label: string; href: string }>;
		cta: { label: string; href: string };
	};
	hero: {
		type: string;
		headline: string;
		subheadline: string;
		body: string;
		primaryCta: { label: string; href: string };
		secondaryCta: { label: string; href: string };
		imageUrl: string;
		imageAlt: string;
	};
	trustBar: {
		enabled: boolean;
		items: Array<{ icon: string; label: string }>;
	};
	problem: {
		enabled: boolean;
		headline: string;
		items: string[];
	};
	solution: {
		enabled: boolean;
		headline: string;
		body: string;
		imageUrl: string;
		imageAlt: string;
	};
	services: {
		enabled: boolean;
		headline: string;
		subheadline: string;
		items: Array<{
			icon: string;
			title: string;
			description: string;
			cta: { label: string; href: string };
		}>;
	};
	/** What we offer: Website SEO, AI Chat Agent, Voice AI, Automation. Optional for legacy stored JSON. */
	features?: {
		enabled: boolean;
		headline: string;
		subheadline: string;
		items: Array<{ icon: string; title: string; description: string }>;
	};
	/** Projects / work / use cases. Optional; when present builds trust. */
	work?: {
		enabled: boolean;
		headline: string;
		subheadline?: string;
		items: Array<{
			title: string;
			description: string;
			imageUrl: string;
			imageAlt: string;
			category?: string;
			outcome?: string;
		}>;
	};
	stats: {
		enabled: boolean;
		items: Array<{ value: string; label: string }>;
	};
	testimonials: {
		enabled: boolean;
		headline: string;
		source: string;
		items: Array<{
			name: string;
			location: string;
			rating: number;
			text: string;
			avatarUrl: string;
		}>;
	};
	cta: {
		enabled: boolean;
		headline: string;
		body: string;
		primaryCta: { label: string; href: string };
		secondaryCta: { label: string; href: string };
		guarantee?: string;
	};
	contact: {
		enabled: boolean;
		headline: string;
		subheadline: string;
		fields: string[];
		submitLabel: string;
		phone: string;
		email: string;
		address: string;
		mapEmbedUrl: string;
	};
	faq: {
		enabled: boolean;
		headline: string;
		items: Array<{ question: string; answer: string }>;
	};
	footer: {
		tagline: string;
		hours: Array<{ days: string; hours: string }>;
		socialLinks: Array<{ platform: string; href: string }>;
		legalLinks: Array<{ label: string; href: string }>;
		copyright: string;
	};
	banner: { enabled: boolean; text: string; cta: { label: string; href: string } | null; type: string };
};
