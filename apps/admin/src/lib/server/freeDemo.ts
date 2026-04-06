import { getProspectById, type Prospect } from '$lib/server/prospects';
import { getScrapedDataForProspect } from '$lib/server/supabase';
import { INDUSTRY_LABELS } from '$lib/industries';
import type { IndustrySlug } from '$lib/industries';
import { error } from '@sveltejs/kit';
import { auditFromScrapedData, computeDataConfidenceScore, DATA_CONFIDENCE_MIN, hasUsableInsight } from '$lib/types/demo';
import type { DemoAudit, DemoLandingContent, AuditModalCopy } from '$lib/types/demo';
import { getTemplates, replaceDemoPlaceholders } from '$lib/server/templates';
import { DEFAULT_TONE } from '$lib/tones';
import type { ToneSlug } from '$lib/tones';

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
 * Call when params.id === 'demo' to serve the cookie-based free preview (e.g. from /upload).
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
	/** F1a: true when score < 50 — do not show full demo; show reason and link to sign in / upload */
	lowData?: boolean;
	lowDataReason?: string;
	/** Custom demo HTML from user template (dashboard prospect path) */
	customDemoHtml?: string;
	/** Gemini + Unsplash landing overrides (hero, CTA, services, images) when present */
	landingContent?: DemoLandingContent | null;
	/** AI-generated audit modal copy (title, why-you, proof, CTAs); when present modal uses it */
	auditModalCopy?: AuditModalCopy | null;
	/** AI-selected tone for template/theme (luxury, rugged, soft-calm, etc.); drives visual style */
	tone?: ToneSlug;
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
		if (!prospect) throw error(404, 'Demo not found or expired. Create a new demo from Upload or the dashboard.');
		throw error(
			503,
			'No audit data for this preview. Sign in and create a demo from the dashboard with DataForSEO or Gemini configured.'
		);
	}
	const prospect = await getProspectById(id);
	if (!prospect) throw error(404, 'Prospect not found');
	const { NO_FIT_GBP_REASON } = await import('$lib/server/qualify');
	if (prospect.flagged && prospect.flaggedReason !== NO_FIT_GBP_REASON) {
		throw error(403, 'This client is out of scope. Demos are not available.');
	}
	const scraped = await getScrapedDataForProspect(id);
	const audit = auditFromScrapedData(scraped as Record<string, unknown> | null);
	if (!audit) {
		throw error(503, 'No audit data for this demo. Recreate the demo from the dashboard with DataForSEO or Gemini configured.');
	}
	const dataConfidenceScore = computeDataConfidenceScore(audit);
	// When we have Gemini insight (grade + recommendations), we can show a default industry demo
	// even with low score (e.g. no website, no reviews). Only block when score is low and no usable insight.
	const canShowDefaultDemo = hasUsableInsight(audit);
	const lowData = dataConfidenceScore < DATA_CONFIDENCE_MIN && !canShowDefaultDemo;
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
	const landingContent = (scraped as Record<string, unknown> | null)?.landingContent as
		| DemoLandingContent
		| undefined
		| null;
	const auditModalCopy = (scraped as Record<string, unknown> | null)?.auditModalCopy as
		| AuditModalCopy
		| undefined
		| null;
	const tone = (scraped as Record<string, unknown> | null)?.tone as ToneSlug | undefined;
	const validTone = tone && ['luxury', 'rugged', 'soft-calm', 'professional', 'friendly', 'minimal'].includes(tone)
		? tone
		: DEFAULT_TONE;
	// TODO: read senderName from Notion (e.g. "Sent by" / "Owner") when available
	return {
		prospect,
		canonicalUrl: `${origin}${pathname}`,
		senderName: undefined,
		audit,
		dataConfidenceScore,
		lowData,
		lowDataReason,
		customDemoHtml,
		landingContent: landingContent ?? null,
		auditModalCopy: auditModalCopy ?? null,
		tone: validTone
	};
}
