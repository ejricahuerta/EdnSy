/**
 * Process one demo creation job from the queue (GBP fetch, landing content, demo_tracking).
 * Used by POST /api/jobs/demo and GET /api/cron/jobs/demo so demos run in the background.
 */

import { getProspectById, updateProspectDemoLink, updateProspectFromGbp, updateProspectIndustry, updateProspectStatus } from '$lib/server/prospects';
import {
	getSupabaseAdmin,
	claimNextPendingDemoJob,
	updateDemoJob,
	updateDemoTrackingStatus,
	upsertDemoTrackingForProspect,
	getScrapedDataForProspectForUser
} from '$lib/server/supabase';
import { getScrapedDataForDemo, getScrapedDataForDemoFromNameOnly, formatScrapedDataErrorMessage, type GbpData } from '$lib/server/gbp';
import { NO_FIT_GBP_REASON } from '$lib/server/qualify';
import { inferIndustryWithGemini } from '$lib/server/insights';
import { inferToneWithGemini } from '$lib/server/generateTone';
import { generateDemoHtmlWithClaude } from '$lib/server/claudeGenerateDemoHtml';
import { uploadDemoHtml } from '$lib/server/demoJsonStorage';
import { getGbpDefaultLocation } from '$lib/server/userSettings';

export type ProcessJobResult =
	| { processed: true; jobId: string; prospectId: string; status: 'done'; demoLink: string; companyName?: string }
	| { processed: true; jobId: string; prospectId: string; status: 'failed'; errorMessage: string; companyName?: string }
	| { processed: false };

/**
 * Claim and process one pending demo job. Returns result for the processed job or { processed: false }.
 */
export async function processOneDemoJob(origin: string): Promise<ProcessJobResult> {
	const job = await claimNextPendingDemoJob();
	if (!job) return { processed: false };

	const { id: jobId, user_id: userId, prospect_id: prospectId } = job;
	try {
		const prospect = await getProspectById(prospectId);
		if (!prospect) {
			const errorMessage = 'Prospect not found';
			await updateDemoJob(jobId, { status: 'failed', errorMessage });
			await updateProspectStatus(prospectId, 'Prospect');
			console.error('[processDemoJob] failed', { jobId, prospectId, errorMessage });
			return { processed: true, jobId, prospectId, status: 'failed', errorMessage };
		}
		// Allow demo for "no online presence" (GBP failed, no valid website); we use name-based insight and stub GBP.
		if (prospect.flagged && prospect.flaggedReason !== NO_FIT_GBP_REASON) {
			const errorMessage = 'Client is out of scope';
			await updateDemoJob(jobId, { status: 'failed', errorMessage });
			await updateProspectStatus(prospectId, 'Prospect');
			console.error('[processDemoJob] failed', { jobId, prospectId, companyName: prospect.companyName, errorMessage });
			return {
				processed: true,
				jobId,
				prospectId,
				status: 'failed',
				errorMessage,
				companyName: prospect.companyName ?? undefined
			};
		}
		if (prospect.demoLink) {
			await updateDemoJob(jobId, { status: 'done', demoLink: prospect.demoLink });
			return {
				processed: true,
				jobId,
				prospectId,
				status: 'done',
				demoLink: prospect.demoLink,
				companyName: prospect.companyName ?? undefined
			};
		}

		// Prefer existing scraped data (GBP) from "Pull insights" when present; otherwise fetch GBP.
		const existingScraped = await getScrapedDataForProspectForUser(userId, prospectId);
		const hasUsableGbp =
			existingScraped &&
			typeof existingScraped === 'object' &&
			existingScraped.gbpRaw != null &&
			typeof existingScraped.gbpRaw === 'object';

		let scrapedData: Record<string, unknown>;
		if (hasUsableGbp) {
			scrapedData = { ...existingScraped } as Record<string, unknown>;
		} else {
			const defaultLocation = await getGbpDefaultLocation(userId);
			let scrapedResult = await getScrapedDataForDemo(prospect, {
				defaultLocation: defaultLocation ?? undefined
			});
			if (!scrapedResult.ok && scrapedResult.errors?.dataforseo) {
				scrapedResult = await getScrapedDataForDemoFromNameOnly(prospect);
			}
			if (!scrapedResult.ok) {
				const msg = formatScrapedDataErrorMessage(scrapedResult.errors);
				await updateDemoJob(jobId, { status: 'failed', errorMessage: msg });
				await updateProspectStatus(prospectId, 'Prospect');
				console.error('[processDemoJob] failed', { jobId, prospectId, companyName: prospect.companyName, errorMessage: msg, errors: scrapedResult.errors });
				return {
					processed: true,
					jobId,
					prospectId,
					status: 'failed',
					errorMessage: msg,
					companyName: prospect.companyName ?? undefined
				};
			}
			scrapedData = scrapedResult.data as Record<string, unknown>;
		}

		// Industry: prefer GBP category, then Gemini inference, then existing prospect.industry. Only update from real GBP (not name-only stub).
		const gbpRawForUpdate = scrapedData.gbpRaw as GbpData | undefined;
		const isRealGbp = gbpRawForUpdate && ((gbpRawForUpdate.ratingCount ?? 0) > 0 || (gbpRawForUpdate.reviews?.length ?? 0) > 0);
		if (isRealGbp && gbpRawForUpdate) {
			await updateProspectFromGbp(prospectId, gbpRawForUpdate);
		}
		const gbpForIndustry = scrapedData.gbpRaw as GbpData | undefined;
		let effectiveIndustry =
			(gbpForIndustry?.industry?.trim() && gbpForIndustry.industry !== 'General'
				? gbpForIndustry.industry
				: null) || prospect.industry?.trim() || '';
		if (!effectiveIndustry || effectiveIndustry === 'General') {
			const inferred = await inferIndustryWithGemini(prospect, gbpForIndustry?.industry);
			if (inferred) {
				await updateProspectIndustry(prospectId, inferred);
				effectiveIndustry = inferred;
			} else {
				effectiveIndustry = 'Professional';
			}
		}

		// AI selects template by tone (luxury, rugged, soft-calm, etc.); stored for demo page theming
		const tone = await inferToneWithGemini(prospect, gbpForIndustry ?? undefined);
		(scrapedData as Record<string, unknown>).tone = tone;

		const gbpRaw = gbpForIndustry;

		if (!gbpRaw) {
			const errorMessage = 'GBP data is required to generate a demo. Run "Pull insights" first.';
			await updateDemoJob(jobId, { status: 'failed', errorMessage });
			await updateProspectStatus(prospectId, 'Prospect');
			console.error('[processDemoJob] failed', { jobId, prospectId, companyName: prospect.companyName, errorMessage });
			return {
				processed: true,
				jobId,
				prospectId,
				status: 'failed',
				errorMessage,
				companyName: prospect.companyName ?? undefined
			};
		}
		const htmlResult = await generateDemoHtmlWithClaude(
			prospect,
			gbpRaw as GbpData,
			effectiveIndustry,
			tone
		);
		if (!htmlResult.ok) {
			const errorMessage = htmlResult.error ?? 'Demo generation failed. Try again.';
			await updateDemoJob(jobId, { status: 'failed', errorMessage });
			await updateProspectStatus(prospectId, 'Prospect');
			console.error('[processDemoJob] failed', { jobId, prospectId, companyName: prospect.companyName, errorMessage });
			return {
				processed: true,
				jobId,
				prospectId,
				status: 'failed',
				errorMessage,
				companyName: prospect.companyName ?? undefined
			};
		}
		const uploadResult = await uploadDemoHtml(prospectId, htmlResult.html);
		if (!uploadResult.ok) {
			const errorMessage = uploadResult.error ?? 'Failed to save demo to storage.';
			await updateDemoJob(jobId, { status: 'failed', errorMessage });
			await updateProspectStatus(prospectId, 'Prospect');
			console.error('[processDemoJob] upload failed', { jobId, prospectId, errorMessage });
			return {
				processed: true,
				jobId,
				prospectId,
				status: 'failed',
				errorMessage,
				companyName: prospect.companyName ?? undefined
			};
		}
		(scrapedData as Record<string, unknown>).demoSource = 'html';

		const demoUrl = `${origin}/demo/${prospectId}`;
		// Update prospect status and demo_tracking so Status column and pipeline reflect the new demo.
		const updateResult = await updateProspectDemoLink(prospectId, demoUrl, 'Demo Created');
		if (!updateResult.ok) {
			const msg = updateResult.error ?? 'Failed to update prospect';
			await updateDemoJob(jobId, { status: 'failed', errorMessage: msg });
			await updateProspectStatus(prospectId, 'Prospect');
			console.error('[processDemoJob] failed', { jobId, prospectId, companyName: prospect.companyName, errorMessage: msg });
			return {
				processed: true,
				jobId,
				prospectId,
				status: 'failed',
				errorMessage: msg,
				companyName: prospect.companyName ?? undefined
			};
		}

		const supabase = getSupabaseAdmin();
		if (supabase) {
			await upsertDemoTrackingForProspect(
				userId,
				prospectId,
				prospect.provider ?? 'manual',
				prospect.provider_row_id ?? prospectId,
				demoUrl,
				'draft'
			);
			await updateDemoTrackingStatus(userId, prospectId, {
				status: 'draft',
				scrapedData
			});
		}
		await updateDemoJob(jobId, { status: 'done', demoLink: demoUrl });
		return {
			processed: true,
			jobId,
			prospectId,
			status: 'done',
			demoLink: demoUrl,
			companyName: prospect.companyName ?? undefined
		};
	} catch (e) {
		const errorMessage = e instanceof Error ? e.message : String(e);
		await updateDemoJob(jobId, { status: 'failed', errorMessage });
		await updateProspectStatus(prospectId, 'Prospect');
		console.error('[processDemoJob] uncaught error', { jobId, prospectId, errorMessage, error: e });
		return { processed: true, jobId, prospectId, status: 'failed', errorMessage };
	}
}
