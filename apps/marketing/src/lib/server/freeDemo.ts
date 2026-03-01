import { getProspectById, type Prospect } from '$lib/server/prospects';
import { getScrapedDataForProspect } from '$lib/server/supabase';
import { INDUSTRY_LABELS } from '$lib/industries';
import type { IndustrySlug } from '$lib/industries';
import { error } from '@sveltejs/kit';
import { getMockDemoAudit, isDemoAuditShape, computeDataConfidenceScore, DATA_CONFIDENCE_MIN } from '$lib/types/demo';
import type { DemoAudit } from '$lib/types/demo';
import { getTemplates, replaceDemoPlaceholders } from '$lib/server/templates';

const COOKIE_NAME = 'lr_free_demo';
const COOKIE_MAX_AGE = 60 * 60; // 1 hour

export type FreeDemoPayload = {
	companyName: string;
	email: string;
	website: string;
	industry: string; // slug
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServerCookies = { get: (name: string) => string | undefined; set: (name: string, value: string, opts?: any) => void };

export function setFreeDemoCookie(cookies: ServerCookies, payload: FreeDemoPayload): void {
	cookies.set(COOKIE_NAME, JSON.stringify(payload), {
		path: '/',
		maxAge: COOKIE_MAX_AGE,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		httpOnly: true
	});
}

/**
 * Read free-demo prospect from cookie. Returns null if missing or industry mismatch.
 * Call when params.id === 'demo' to serve the Try free demo page.
 */
export function getFreeDemoProspect(cookies: ServerCookies, industrySlug: string): Prospect | null {
	const raw = cookies.get(COOKIE_NAME);
	if (!raw) return null;
	try {
		const data = JSON.parse(raw) as FreeDemoPayload;
		if (data.industry !== industrySlug) return null;
		const industryLabel = INDUSTRY_LABELS[industrySlug as IndustrySlug] ?? industrySlug;
		return {
			id: 'demo',
			companyName: data.companyName || 'Your prospect',
			email: data.email || '',
			website: data.website || '',
			industry: industryLabel,
			status: 'Demo',
			demoLink: undefined
		};
	} catch {
		return null;
	}
}

export type DemoPageData = {
	prospect: Prospect;
	canonicalUrl: string;
	/** Sender name (who generated the demo); from CRM when available */
	senderName?: string;
	/** Audit data for "What we found" section; mock when no scraped data */
	audit: DemoAudit;
	/** F1a: data confidence 0–100; below DATA_CONFIDENCE_MIN we show low-data message */
	dataConfidenceScore?: number;
	/** F1a: true when score < 50 — do not show full demo; show reason and link to try */
	lowData?: boolean;
	lowDataReason?: string;
	/** Custom demo HTML from user template (dashboard prospect path) */
	customDemoHtml?: string;
};

/**
 * Resolve prospect for a demo page: Notion by id, or free-demo cookie when id === 'demo'.
 */
export async function getProspectForDemoPage(
	id: string,
	industrySlug: string,
	cookies: ServerCookies,
	origin: string,
	pathname: string
): Promise<DemoPageData> {
	if (id === 'demo') {
		const prospect = getFreeDemoProspect(cookies, industrySlug);
		if (!prospect) throw error(404, 'Demo not found or expired. Try again from the Try free page.');
		const audit = getMockDemoAudit();
		const dataConfidenceScore = computeDataConfidenceScore(audit);
		const lowData = dataConfidenceScore < DATA_CONFIDENCE_MIN;
		const lowDataReason = lowData
			? `Not enough public data to build a reliable demo (score ${dataConfidenceScore}%). Add a website or double-check the business name.`
			: undefined;
		return {
			prospect,
			canonicalUrl: `${origin}${pathname}`,
			audit,
			dataConfidenceScore,
			lowData,
			lowDataReason
		};
	}
	const prospect = await getProspectById(id);
	if (!prospect) throw error(404, 'Prospect not found');
	const scraped = await getScrapedDataForProspect(id);
	const audit: DemoAudit = isDemoAuditShape(scraped) ? scraped : getMockDemoAudit();
	const dataConfidenceScore = computeDataConfidenceScore(audit);
	const lowData = dataConfidenceScore < DATA_CONFIDENCE_MIN;
	const lowDataReason = lowData
		? `Not enough public data to build a reliable demo (score ${dataConfidenceScore}%). Add a website or double-check the business name.`
		: undefined;
	let customDemoHtml: string | undefined;
	if (prospect.userId) {
		const templates = await getTemplates(prospect.userId);
		if (templates.demoHtml?.trim()) {
			customDemoHtml = replaceDemoPlaceholders(templates.demoHtml.trim(), {
				companyName: prospect.companyName || '',
				website: prospect.website || '',
				address: prospect.address || '',
				city: prospect.city || '',
				senderName: '', // TODO: from CRM when available
				prospectId: prospect.id,
				industrySlug
			});
		}
	}
	// TODO: read senderName from Notion (e.g. "Sent by" / "Owner") when available
	return {
		prospect,
		canonicalUrl: `${origin}${pathname}`,
		senderName: undefined,
		audit,
		dataConfidenceScore,
		lowData,
		lowDataReason,
		customDemoHtml
	};
}
