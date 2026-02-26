const VALID_IMAGE_PREFIX = 'https://';

function isValidImageUrl(url: unknown): boolean {
	return typeof url === 'string' && url.startsWith(VALID_IMAGE_PREFIX) && url.length > 20;
}

/**
 * Merges Gemini-generated website data with static content so image URLs and alts
 * always have valid fallbacks (Gemini may omit or return invalid image fields).
 */
export function mergeWithStaticImages<T extends Record<string, unknown>>(
	websiteData: T | null,
	staticContent: T
): T {
	if (!websiteData) return staticContent;

	const result = { ...websiteData } as T;
	const w = websiteData as Record<string, unknown>;
	const s = staticContent as Record<string, unknown>;

	// Hero: ensure image and imageAlt are valid
	const hero = (w.hero as Record<string, unknown>) ?? {};
	const staticHero = (s.hero as Record<string, unknown>) ?? {};
	(result as Record<string, unknown>).hero = {
		...hero,
		image: isValidImageUrl(hero.image) ? hero.image : (staticHero.image ?? ''),
		imageAlt: (hero.imageAlt && String(hero.imageAlt).trim()) ? hero.imageAlt : (staticHero.imageAlt ?? '')
	};

	// About: same
	const about = (w.about as Record<string, unknown>) ?? {};
	const staticAbout = (s.about as Record<string, unknown>) ?? {};
	(result as Record<string, unknown>).about = {
		...about,
		image: isValidImageUrl(about.image) ? about.image : (staticAbout.image ?? ''),
		imageAlt: (about.imageAlt && String(about.imageAlt).trim()) ? about.imageAlt : (staticAbout.imageAlt ?? '')
	};

	// Innovation (e.g. healthcare): ensure image and imageAlt when static has them
	const staticInnovation = s.innovation as Record<string, unknown> | undefined;
	if (staticInnovation) {
		const innovation = (w.innovation as Record<string, unknown>) ?? {};
		(result as Record<string, unknown>).innovation = {
			...innovation,
			image: isValidImageUrl(innovation.image) ? innovation.image : (staticInnovation.image ?? ''),
			imageAlt: (innovation.imageAlt && String(innovation.imageAlt).trim()) ? innovation.imageAlt : (staticInnovation.imageAlt ?? '')
		};
	}

	// CTA (e.g. healthcare): ensure image and imageAlt when static has them
	const staticCta = s.cta as Record<string, unknown> | undefined;
	if (staticCta) {
		const cta = (w.cta as Record<string, unknown>) ?? {};
		(result as Record<string, unknown>).cta = {
			...cta,
			image: isValidImageUrl(cta.image) ? cta.image : (staticCta.image ?? ''),
			imageAlt: (cta.imageAlt && String(cta.imageAlt).trim()) ? cta.imageAlt : (staticCta.imageAlt ?? '')
		};
	}

	return result;
}
