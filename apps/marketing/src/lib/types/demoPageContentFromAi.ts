/**
 * AI-generated page content (Gemini + GBP + insight). Has imageQuery fields;
 * image URLs are resolved via Unsplash and merged into DemoPageJson.
 */

export type DemoPageContentFromAi = {
	meta: { title: string; description: string };
	tone: { name: string; copyVoice: string };
	nav: { links: Array<{ label: string; href: string }>; ctaLabel: string };
	hero: {
		headline: string;
		subheadline: string;
		body: string;
		primaryCta: string;
		secondaryCta: string;
		heroImageQuery: string;
		heroImageAlt: string;
	};
	trustBar: { items: Array<{ icon: string; label: string }> };
	problem: { headline: string; items: string[] };
	solution: {
		headline: string;
		body: string;
		solutionImageQuery: string;
		solutionImageAlt: string;
	};
	services: {
		headline: string;
		subheadline: string;
		items: Array<{ icon: string; title: string; description: string; ctaLabel: string }>;
	};
	/** Optional work/projects/use cases; each item has imageQuery for Unsplash resolution. */
	work?: {
		headline: string;
		subheadline?: string;
		items: Array<{
			title: string;
			description: string;
			imageQuery: string;
			imageAlt: string;
			category?: string;
			outcome?: string;
		}>;
	};
	stats: { items: Array<{ value: string; label: string }> };
	testimonials: {
		headline: string;
		source: string;
		items: Array<{
			name: string;
			location: string;
			rating: number;
			text: string;
		}>;
		testimonialAvatarQuery: string;
	};
	cta: {
		headline: string;
		body: string;
		primaryCta: string;
		secondaryCta: string;
		guarantee?: string;
	};
	faq: { headline: string; items: Array<{ question: string; answer: string }> };
	footer: {
		tagline: string;
		copyright: string;
		hours?: Array<{ days: string; hours: string }>;
	};
};
