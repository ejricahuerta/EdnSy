import type { IndustrySlug } from '$lib/industries';
import { getBusinessData, getWebsiteData } from '$lib/server/demoData';
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
	if (!content) return 'You are Syd, a friendly AI assistant. This is a business demo page. Answer briefly and helpfully about the business.';

	const hero = content.hero as { tagline?: string; subtext?: string; companyName?: string; headline?: string; body?: string } | undefined;
	const businessName =
		displayName ||
		hero?.tagline ||
		hero?.companyName ||
		hero?.headline ||
		'The business';
	const services = content.services as { heading?: string; items?: { title: string; description?: string }[] } | undefined;
	const about = content.about as { heading?: string; subtext?: string } | undefined;
	const contact = content.contact as { address?: string; phone?: string; email?: string } | undefined;
	const faq = content.faq as { items?: { q: string; a: string }[] } | undefined;

	const parts: string[] = [
		'You are Syd, a friendly AI assistant. Introduce yourself as Syd when it fits naturally.',
		`You help answer questions for "${businessName}".`,
		'Answer only about this business and the information below. Keep answers concise and friendly.',
		'If asked about booking or appointments, suggest they use the "Book" button or link on the page.'
	];

	if (hero?.tagline) parts.push(`Tagline: ${hero.tagline}`);
	if (hero?.headline) parts.push(`Headline: ${hero.headline}`);
	if (hero?.subtext) parts.push(`About: ${hero.subtext}`);
	if (hero?.body) parts.push(`About: ${hero.body}`);

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

/**
 * Build chat context from this prospect's Business Data and Website Data (Notion).
 * Use when the user is on a demo page so the AI can answer using the actual business and landing content.
 */
export async function getPageContextForProspect(
	prospectId: string,
	displayName?: string
): Promise<string | null> {
	const [businessData, websiteData] = await Promise.all([
		getBusinessData(prospectId),
		getWebsiteData(prospectId)
	]);

	const parts: string[] = [
		'You are Syd, a friendly AI assistant. Introduce yourself as Syd when it fits naturally.',
		`You help answer questions for "${displayName || businessData?.companyName || 'this business'}".`,
		'Answer only about this business and the information below. Keep answers concise and friendly.',
		'If asked about booking or appointments, suggest they use the "Book" button or link on the page.'
	];

	// Business Data (scraped)
	if (businessData) {
		if (businessData.companyName) parts.push(`Business name: ${businessData.companyName}`);
		if (businessData.phone) parts.push(`Phone: ${businessData.phone}`);
		if (businessData.email) parts.push(`Email: ${businessData.email}`);
		if (businessData.address) parts.push(`Address: ${businessData.address}`);
		if (businessData.city) parts.push(`City: ${businessData.city}`);
		if (businessData.website) parts.push(`Website: ${businessData.website}`);
		if (businessData.metaDescription) parts.push(`Summary: ${businessData.metaDescription}`);
		if (businessData.websiteText && businessData.websiteText.length > 200) {
			parts.push(`About the business (from their site): ${businessData.websiteText.slice(0, 1500)}...`);
		} else if (businessData.websiteText) {
			parts.push(`About the business: ${businessData.websiteText}`);
		}
	}

	// Website Data (generated landing content)
	if (websiteData) {
		const w = websiteData as Record<string, unknown>;
		const hero = w.hero as { tagline?: string; subtext?: string; headline?: string } | undefined;
		if (hero?.tagline) parts.push(`Tagline: ${hero.tagline}`);
		if (hero?.headline) parts.push(`Headline: ${hero.headline}`);
		if (hero?.subtext) parts.push(`About: ${hero.subtext}`);

		const services = w.services as { items?: { title: string; description?: string }[] } | undefined;
		if (services?.items?.length) {
			parts.push('Services: ' + services.items.map((s) => s.title + (s.description ? ` – ${s.description}` : '')).join('. '));
		}

		const about = w.about as { subtext?: string } | undefined;
		if (about?.subtext) parts.push(`About us: ${about.subtext}`);

		const contact = w.contact as { address?: string; phone?: string; email?: string } | undefined;
		if (contact) {
			const c = [contact.address, contact.phone, contact.email].filter(Boolean).join(', ');
			if (c) parts.push(`Contact: ${c}`);
		}

		const faq = w.faq as { items?: { q: string; a: string }[] } | undefined;
		if (faq?.items?.length) {
			parts.push('FAQ (use to answer): ' + faq.items.map((i) => `Q: ${i.q} A: ${i.a}`).join(' | '));
		}
	}

	if (parts.length <= 3) return null;
	return parts.join('\n\n');
}
