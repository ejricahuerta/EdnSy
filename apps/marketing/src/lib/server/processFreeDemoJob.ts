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
import { inferToneWithGemini } from '$lib/server/generateTone';
import { generateDemoHtmlWithClaude } from '$lib/server/claudeGenerateDemoHtml';
import { uploadDemoHtml } from '$lib/server/demoJsonStorage';
import { INDUSTRY_LABELS } from '$lib/industries';
import type { IndustrySlug } from '$lib/industries';
import { sendEmail } from '$lib/server/send';
import { escapeHtml } from '$lib/server/send';
import { LEGAL_COMPANY_NAME, LEGAL_COMPANY_ADDRESS } from '$lib/constants';

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
	const industrySlug = (row.industry?.trim() || 'professional') as IndustrySlug;
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
			console.error('[processFreeDemoJob] failed', { requestId, companyName: row.company_name, errorMessage: msg });
			return { processed: true, requestId, status: 'failed', errorMessage: msg };
		}

		const scrapedData = scrapedResult.data as Record<string, unknown>;
		const gbpRaw = scrapedData.gbpRaw as GbpData | undefined;
		let effectiveIndustry =
			(gbpRaw?.industry?.trim() && gbpRaw.industry !== 'General' ? gbpRaw.industry : null) ||
			prospect.industry?.trim() ||
			'Professional';
		if (!effectiveIndustry || effectiveIndustry === 'General') {
			const inferred = await inferIndustryWithGemini(prospect, gbpRaw?.industry);
			if (inferred) effectiveIndustry = inferred;
			else effectiveIndustry = 'Professional';
		}

		const tone = await inferToneWithGemini(prospect, gbpRaw ?? undefined);
		if (!gbpRaw) {
			const errorMessage = 'We couldn’t find enough business data to build your demo. Try adding a website or a more specific business name.';
			await updateFreeDemoRequest(requestId, { status: 'failed', errorMessage });
			console.error('[processFreeDemoJob] failed', { requestId, companyName: row.company_name, errorMessage });
			return { processed: true, requestId, status: 'failed', errorMessage };
		}

		const htmlResult = await generateDemoHtmlWithClaude(
			prospect,
			gbpRaw,
			effectiveIndustry,
			tone
		);
		if (!htmlResult.ok) {
			const errorMessage = htmlResult.error ?? 'Demo generation failed. Try again.';
			await updateFreeDemoRequest(requestId, { status: 'failed', errorMessage });
			console.error('[processFreeDemoJob] failed', { requestId, companyName: row.company_name, errorMessage });
			return { processed: true, requestId, status: 'failed', errorMessage };
		}

		const uploadResult = await uploadDemoHtml(requestId, htmlResult.html);
		if (!uploadResult.ok) {
			const errorMessage = uploadResult.error ?? 'Failed to save demo.';
			await updateFreeDemoRequest(requestId, { status: 'failed', errorMessage });
			console.error('[processFreeDemoJob] upload failed', { requestId, errorMessage });
			return { processed: true, requestId, status: 'failed', errorMessage };
		}

		const demoLink = `${origin}/demo/${requestId}`;
		await updateFreeDemoRequest(requestId, { status: 'done', demoLink });

		// Send email with link (no userId = use Resend default)
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
		await sendEmail(row.email.trim(), subject, html);

		return { processed: true, requestId, status: 'done', demoLink };
	} catch (e) {
		const errorMessage = e instanceof Error ? e.message : String(e);
		await updateFreeDemoRequest(requestId, { status: 'failed', errorMessage });
		console.error('[processFreeDemoJob] uncaught', { requestId, errorMessage, error: e });
		return { processed: true, requestId, status: 'failed', errorMessage };
	}
}
