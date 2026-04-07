/**
 * Single entry point for demo industry content.
 */
import { INDUSTRY_SLUGS, type IndustrySlug } from '$lib/industries';
import { dentalDemoContent } from './dental';

export type DemoContent = typeof dentalDemoContent;

const CONTENT_MAP = Object.fromEntries(
	INDUSTRY_SLUGS.map((slug) => [slug, dentalDemoContent])
) as Record<IndustrySlug, DemoContent>;

export function getDemoContent(slug: IndustrySlug): DemoContent {
	return CONTENT_MAP[slug] ?? dentalDemoContent;
}

export { dentalDemoContent };
