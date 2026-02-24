import type { IndustrySlug } from '$lib/industries';
import { healthcareDemoContent } from '$lib/content/healthcare';
import { dentalDemoContent } from '$lib/content/dental';
import { constructionDemoContent } from '$lib/content/construction';
import { salonsDemoContent } from '$lib/content/salons';
import { soloProfessionalsDemoContent } from '$lib/content/solo-professionals';
import { realEstateDemoContent } from '$lib/content/realEstate';
import { legalDemoContent } from '$lib/content/legal';
import { fitnessDemoContent } from '$lib/content/fitness';

const CONTENT_BY_SLUG: Record<IndustrySlug, Record<string, unknown>> = {
	healthcare: healthcareDemoContent as Record<string, unknown>,
	dental: dentalDemoContent as Record<string, unknown>,
	construction: constructionDemoContent as Record<string, unknown>,
	salons: salonsDemoContent as Record<string, unknown>,
	'solo-professionals': soloProfessionalsDemoContent as Record<string, unknown>,
	'real-estate': realEstateDemoContent as Record<string, unknown>,
	legal: legalDemoContent as Record<string, unknown>,
	fitness: fitnessDemoContent as Record<string, unknown>
};

/**
 * Build a text summary of the current page content for the AI chat context.
 * Used as system/context for the assistant so answers stay on-topic.
 */
export function getPageContextForIndustry(
	industrySlug: IndustrySlug,
	displayName?: string
): string {
	const content = CONTENT_BY_SLUG[industrySlug];
	if (!content) return 'This is a business demo page. Answer briefly and helpfully about the business.';

	const businessName = displayName || (content as { hero?: { tagline?: string } }).hero?.tagline || 'The business';
	const hero = content.hero as { tagline?: string; subtext?: string } | undefined;
	const services = content.services as { heading?: string; items?: { title: string; description?: string }[] } | undefined;
	const about = content.about as { heading?: string; subtext?: string } | undefined;
	const contact = content.contact as { address?: string; phone?: string; email?: string } | undefined;
	const faq = content.faq as { items?: { q: string; a: string }[] } | undefined;

	const parts: string[] = [
		`You are a helpful assistant for "${businessName}".`,
		'Answer only about this business and the information below. Keep answers concise and friendly.',
		'If asked about booking or appointments, suggest they use the "Book" button or link on the page.'
	];

	if (hero?.tagline) parts.push(`Tagline: ${hero.tagline}`);
	if (hero?.subtext) parts.push(`About: ${hero.subtext}`);

	if (services?.items?.length) {
		parts.push('Services: ' + services.items.map((s) => s.title + (s.description ? ` – ${s.description}` : '')).join('. '));
	}
	if (about?.subtext) parts.push(`About us: ${about.subtext}`);
	if (contact) {
		const c = [contact.address, contact.phone, contact.email].filter(Boolean).join(', ');
		if (c) parts.push(`Contact: ${c}`);
	}
	if (faq?.items?.length) {
		parts.push('FAQ (use to answer): ' + faq.items.map((i) => `Q: ${i.q} A: ${i.a}`).join(' | '));
	}

	return parts.join('\n\n');
}
