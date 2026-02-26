import type { BusinessData } from '$lib/types/demo';

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g;

function stripHtml(html: string): string {
	return html
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
		.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function extractMeta(html: string): { title: string; description: string } {
	let title = '';
	let description = '';
	const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
	if (titleMatch) title = stripHtml(titleMatch[1]);
	const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
		|| html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
	if (metaDesc) description = metaDesc[1].trim();
	return { title, description };
}

function extractBodyText(html: string): string {
	const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
	const raw = bodyMatch ? bodyMatch[1] : html;
	const text = stripHtml(raw);
	return text.slice(0, 15000);
}

/**
 * Scrape a business website for contact info and main text.
 * Uses fetch + regex; no headless browser. Some sites may block or require JS.
 */
export async function scrapeWebsite(
	url: string,
	existing: Partial<Pick<BusinessData, 'companyName' | 'email' | 'phone' | 'address' | 'city'>> = {}
): Promise<Omit<BusinessData, 'scrapedAt' | 'source'>> {
	const normalized = url.startsWith('http') ? url : `https://${url}`;
	let html: string;
	try {
		const res = await fetch(normalized, {
			headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EdnSyDemoBot/1.0)' },
			redirect: 'follow'
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		html = await res.text();
	} catch (e) {
		const err = e instanceof Error ? e.message : String(e);
		return {
			companyName: existing.companyName ?? '',
			website: normalized,
			email: existing.email,
			phone: existing.phone,
			address: existing.address,
			city: existing.city,
			websiteText: `(Could not fetch: ${err})`,
			pageTitle: (existing.companyName ?? '') || 'Business',
			metaDescription: ''
		};
	}

	const { title, description } = extractMeta(html);
	const bodyText = extractBodyText(html);
	const emails = [...new Set((bodyText.match(EMAIL_REGEX) ?? []).slice(0, 5))];
	const phones = [...new Set((bodyText.match(PHONE_REGEX) ?? []).slice(0, 5))];

	return {
		companyName: (existing.companyName ?? title) || 'Business',
		website: normalized,
		email: existing.email ?? emails[0],
		phone: existing.phone ?? phones[0],
		address: existing.address,
		city: existing.city,
		websiteText: [title, description, bodyText.slice(0, 12000)].filter(Boolean).join('\n\n'),
		pageTitle: (title || existing.companyName) ?? '',
		metaDescription: description || undefined
	};
}

/**
 * Try to enrich with Yellow Pages data (name + city search).
 * Uses a public YP search URL; may be blocked or rate-limited. Merges into business data.
 */
export async function scrapeYellowPages(
	companyName: string,
	city?: string
): Promise<{ phone?: string; address?: string; hours?: string; rawSnippet?: string } | null> {
	const query = city ? `${encodeURIComponent(companyName)} ${encodeURIComponent(city)}` : encodeURIComponent(companyName);
	// Canadian Yellow Pages search (example; adjust domain if needed)
	const searchUrl = `https://www.yellowpages.ca/search/si/1/${query.replace(/\s+/g, '+')}`;
	try {
		const res = await fetch(searchUrl, {
			headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EdnSyDemoBot/1.0)' },
			redirect: 'follow'
		});
		if (!res.ok) return null;
		const html = await res.text();
		const text = stripHtml(html);
		const phone = text.match(PHONE_REGEX)?.[0];
		return {
			phone: phone ?? undefined,
			rawSnippet: text.slice(0, 2000)
		};
	} catch {
		return null;
	}
}

/**
 * Scrape website and optionally Yellow Pages, then return BusinessData ready to save.
 */
export async function scrapeBusinessData(prospect: {
	companyName: string;
	website?: string;
	email?: string;
	phone?: string;
	address?: string;
	city?: string;
}): Promise<BusinessData> {
	const existing = {
		companyName: prospect.companyName,
		email: prospect.email,
		phone: prospect.phone,
		address: prospect.address,
		city: prospect.city
	};

	let websiteResult: Omit<BusinessData, 'scrapedAt' | 'source'> | null = null;
	if (prospect.website) {
		websiteResult = await scrapeWebsite(prospect.website, existing);
	} else {
		websiteResult = {
			companyName: prospect.companyName,
			email: prospect.email,
			phone: prospect.phone,
			address: prospect.address,
			city: prospect.city,
			websiteText: '',
			pageTitle: prospect.companyName,
			metaDescription: ''
		};
	}

	let yellowPages = null;
	if (prospect.companyName) {
		yellowPages = await scrapeYellowPages(prospect.companyName, prospect.city ?? undefined);
	}

	const scrapedAt = new Date().toISOString();
	let source: BusinessData['source'] = 'website';
	if (yellowPages && prospect.website) source = 'both';
	else if (yellowPages) source = 'yellowpages';

	const out: BusinessData = {
		...websiteResult,
		scrapedAt,
		source
	};
	if (yellowPages) {
		out.yellowPages = yellowPages;
		if (yellowPages.phone && !out.phone) out.phone = yellowPages.phone;
	}
	return out;
}
