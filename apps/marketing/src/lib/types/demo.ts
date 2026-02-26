/**
 * Prospect data from Notion CRM used by demo landing pages.
 * Mirrors the shape returned by $lib/server/notion (without importing server code).
 */
export type DemoProspect = {
	id: string;
	companyName: string;
	email: string;
	website: string;
	phone?: string;
	address?: string;
	city?: string;
	industry: string;
	status: string;
	demoLink?: string;
};

/**
 * Scraped business data from website and/or Yellow Pages.
 * Stored as JSON and used as input for Gemini to generate Website Data.
 */
export type BusinessData = {
	companyName: string;
	website?: string;
	email?: string;
	phone?: string;
	address?: string;
	city?: string;
	/** Raw or structured text extracted from the website (meta, headings, body). */
	websiteText?: string;
	/** Page title from the website. */
	pageTitle?: string;
	/** Meta description if present. */
	metaDescription?: string;
	/** Any extra fields from Yellow Pages or scraping. */
	yellowPages?: {
		phone?: string;
		address?: string;
		hours?: string;
		rawSnippet?: string;
	};
	scrapedAt: string; // ISO
	source: 'website' | 'yellowpages' | 'both';
};

/**
 * Generated landing-page content (hero, services, about, etc.).
 * Same shape as industry demo content (e.g. salons.ts) so templates can use it as-is.
 */
export type WebsiteData = Record<string, unknown>;
