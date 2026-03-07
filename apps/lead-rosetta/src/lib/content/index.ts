/**
 * Single entry point for demo industry content. Maps industry slug to static content.
 * Used by the unified DemoLanding template (style-guides-v1.2).
 */
import type { IndustrySlug } from '$lib/industries';
import { constructionDemoContent } from './construction';
import { healthcareDemoContent } from './healthcare';
import { dentalDemoContent } from './dental';
import { legalDemoContent } from './legal';
import { fitnessDemoContent } from './fitness';
import { realEstateDemoContent } from './realEstate';
import { salonsDemoContent } from './salons';
import { professionalDemoContent } from './professional';

export type DemoContent = typeof constructionDemoContent;

const CONTENT_MAP: Record<IndustrySlug, DemoContent> = {
	construction: constructionDemoContent,
	healthcare: healthcareDemoContent,
	dental: dentalDemoContent,
	legal: legalDemoContent,
	fitness: fitnessDemoContent,
	'real-estate': realEstateDemoContent,
	salons: salonsDemoContent,
	professional: professionalDemoContent
};

export function getDemoContent(slug: IndustrySlug): DemoContent {
	const content = CONTENT_MAP[slug];
	if (!content) return constructionDemoContent;
	return content;
}

export {
	constructionDemoContent,
	healthcareDemoContent,
	dentalDemoContent,
	legalDemoContent,
	fitnessDemoContent,
	realEstateDemoContent,
	salonsDemoContent,
	professionalDemoContent
};
