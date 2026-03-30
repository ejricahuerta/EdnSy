/**
 * Process one free (try) demo request: GBP fetch, generate HTML, upload, email link.
 * Runs in background via same cron/API as processOneDemoJob.
 */

import type { Prospect } from '$lib/server/prospects';
import {
	claimNextPendingFreeDemoJob,
	updateFreeDemoRequest
} from '$lib/server/supabase';
import { getScrapedDataForDemo, getScrapedDataForDemoFromNameOnly, formatScrapedDataErrorMessage, type GbpData } from '$lib/server/gbp';
import { inferIndustryWithGemini } from '$lib/server/insights';
import { analyzeWebsiteAndProduceDemoJson } from '$lib/ai-agents';
import { inferToneWithGemini } from '$lib/server/generateTone';
import { generateDemoHtmlWithClaude } from '$lib/server/claudeGenerateDemoHtml';
import { uploadDemoHtml, uploadDemoHtmlPart } from '$lib/server/demoJsonStorage';
import { INDUSTRY_LABELS } from '$lib/industries';
import type { IndustrySlug } from '$lib/industries';
import { sendEmail } from '$lib/server/send';
import { escapeHtml } from '$lib/server/send';
import { LEGAL_COMPANY_NAME, LEGAL_COMPANY_ADDRESS } from '$lib/constants';
import type { LandingPageIndexJson } from '$lib/types/landingPageIndexJson';
import { serverError } from '$lib/server/logger';

export type ProcessFreeDemoJobResult =
	| { processed: true; requestId: string; status: 'done'; demoLink: string }
	| { processed: true; requestId: string; status: 'failed'; errorMessage: string }
	| { processed: false };

function prospectFromFreeDemoRow(row: {
	id: string;
	email: string;
	company_name: string;
	website: string | null;
	industry: string;
}): Prospect {
	const industrySlug = (row.industry?.trim() || 'dental') as IndustrySlug;
	return {
		id: row.id,
		companyName: row.company_name?.trim() ?? '',
		email: row.email?.trim() ?? '',
		website: row.website?.trim() ?? '',
		industry: INDUSTRY_LABELS[industrySlug] ?? industrySlug ?? 'Professional',
		status: 'Demo'
	};
}

/**
 * Claim and process one pending free demo request. Returns result or { processed: false }.
 */
export async function processOneFreeDemoJob(origin: string): Promise<ProcessFreeDemoJobResult> {
	const row = await claimNextPendingFreeDemoJob();
	if (!row) return { processed: false };

	const requestId = row.id;
	const prospect = prospectFromFreeDemoRow(row);

	try {
		let scrapedResult = await getScrapedDataForDemo(prospect);
		if (!scrapedResult.ok && scrapedResult.errors?.dataforseo) {
			scrapedResult = await getScrapedDataForDemoFromNameOnly(prospect);
		}
		if (!scrapedResult.ok) {
			const msg = formatScrapedDataErrorMessage(scrapedResult.errors);
			await updateFreeDemoRequest(requestId, { status: 'failed', errorMessage: msg });
			serverError('processFreeDemoJob', 'failed', { requestId, companyName: row.company_name, errorMessage: msg });
			return { processed: true, requestId, status: 'failed', errorMessage: msg };
		}

		const scrapedData = scrapedResult.data as Record<string, unknown>;
		const gbpRaw = scrapedData.gbpRaw as GbpData | undefined;
		// Industry: always use AI so we don't rely on GBP category.
		const inferred = await inferIndustryWithGemini(prospect, undefined);
		const effectiveIndustry = inferred ?? (prospect.industry?.trim() || 'Professional');

		const tone = await inferToneWithGemini(prospect, gbpRaw ?? undefined);
		if (!gbpRaw) {
			const errorMessage = 'We couldn’t find enough business data to build your demo. Try adding a website or a more specific business name.';
			await updateFreeDemoRequest(requestId, { status: 'failed', errorMessage });
			serverError('processFreeDemoJob', 'failed', { requestId, companyName: row.company_name, errorMessage });
			return { processed: true, requestId, status: 'failed', errorMessage };
		}

		let websiteDemoJson: LandingPageIndexJson | null = null;
		if (prospect.website?.trim().startsWith('http')) {
			const websiteResult = await analyzeWebsiteAndProduceDemoJson({
				websiteUrl: prospect.website.trim(),
				prospect,
				gbpSummary: { name: gbpRaw.name, address: gbpRaw.address, category: gbpRaw.industry }
			});
			if (websiteResult.ok && websiteResult.data.demoJson != null) {
				websiteDemoJson = websiteResult.data.demoJson;
			}
		}

		const htmlResult = await generateDemoHtmlWithClaude(
			prospect,
			gbpRaw,
			effectiveIndustry,
			tone,
			websiteDemoJson ?? undefined
		);
		if (!htmlResult.ok) {
			const errorMessage = htmlResult.error ?? 'Demo generation failed. Try again.';
			await updateFreeDemoRequest(requestId, { status: 'failed', errorMessage });
			serverError('processFreeDemoJob', 'failed', { requestId, companyName: row.company_name, errorMessage });
			return { processed: true, requestId, status: 'failed', errorMessage };
		}

		if (htmlResult.parts) {
			const [p1, p2, p3] = htmlResult.parts;
			const u1 = await uploadDemoHtmlPart(requestId, 1, p1);
			const u2 = await uploadDemoHtmlPart(requestId, 2, p2);
			const u3 = await uploadDemoHtmlPart(requestId, 3, p3);
			if (!u1.ok || !u2.ok || !u3.ok) {
				const errorMessage = u1.error ?? u2.error ?? u3.error ?? 'Failed to save demo.';
				await updateFreeDemoRequest(requestId, { status: 'failed', errorMessage });
				serverError('processFreeDemoJob', 'part upload failed', { requestId, errorMessage });
				return { processed: true, requestId, status: 'failed', errorMessage };
			}
		} else {
			const uploadResult = await uploadDemoHtml(requestId, htmlResult.html);
			if (!uploadResult.ok) {
				const errorMessage = uploadResult.error ?? 'Failed to save demo.';
				await updateFreeDemoRequest(requestId, { status: 'failed', errorMessage });
				serverError('processFreeDemoJob', 'upload failed', { requestId, errorMessage });
				return { processed: true, requestId, status: 'failed', errorMessage };
			}
		}

		const demoLink = `${origin}/demo/${requestId}`;
		await updateFreeDemoRequest(requestId, { status: 'done', demoLink });

		// Notification email: sending is Gmail-only and requires a user context; free-demo job has none, so we skip it
		const company = prospect.companyName || 'your business';
		const subject = `Your demo for ${company} is ready`;
		const safeCompany = escapeHtml(company);
		const html = `
<p>Hi,</p>
<p>Your free demo for ${safeCompany} is ready.</p>
<p><a href="${demoLink}">View your demo</a></p>
<p>— Lead Rosetta</p>
<hr style="margin-top:1.5em; border:none; border-top:1px solid #eee;" />
<p style="font-size:0.85em; color:#666;">${LEGAL_COMPANY_NAME} | ${LEGAL_COMPANY_ADDRESS}</p>
`.trim();
		const sendResult = await sendEmail(row.email.trim(), subject, html);
		if (!sendResult.ok) {
			serverError('processFreeDemoJob', 'notification email skipped (Gmail-only, no user context)', {
				requestId,
				error: sendResult.error
			});
		}

		return { processed: true, requestId, status: 'done', demoLink };
	} catch (e) {
		const errorMessage = e instanceof Error ? e.message : String(e);
		await updateFreeDemoRequest(requestId, { status: 'failed', errorMessage });
		serverError('processFreeDemoJob', 'uncaught', { requestId, errorMessage, error: e });
		return { processed: true, requestId, status: 'failed', errorMessage };
	}
}
