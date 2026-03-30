/**
 * Single entry point for demo industry content. Dental-only product scope.
 */
import type { IndustrySlug } from '$lib/industries';
import { dentalDemoContent } from './dental';

export type DemoContent = typeof dentalDemoContent;

const CONTENT_MAP: Record<IndustrySlug, DemoContent> = {
	dental: dentalDemoContent
};

export function getDemoContent(slug: IndustrySlug): DemoContent {
	return CONTENT_MAP[slug] ?? dentalDemoContent;
}

export { dentalDemoContent };
