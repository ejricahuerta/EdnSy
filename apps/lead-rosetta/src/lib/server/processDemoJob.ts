/**
 * Process one demo creation job from the queue. Uses scraped data from the qualifying (GBP) step only.
 * Used by POST /api/jobs/demo and GET /api/cron/jobs/demo so demos run in the background.
 * Paid demo jobs require the external demo generator: set DEMO_GENERATOR_URL, DEMO_GENERATOR_API_KEY, and DEMO_CALLBACK_SECRET (no in-app fallback).
 */

import { env } from '$env/dynamic/private';
import { getProspectById, updateProspectFromGbp, updateProspectIndustry, updateProspectStatus } from '$lib/server/prospects';
import { claimNextPendingDemoJob, updateDemoJob, getScrapedDataForProspectForUser } from '$lib/server/supabase';
import type { GbpData } from '$lib/server/gbp';
import type { GeminiInsight } from '$lib/types/demo';
import { NO_FIT_GBP_REASON } from '$lib/server/qualify';
import { generateInsightForProspect, inferIndustryWithGemini } from '$lib/server/insights';
import { inferToneWithGemini } from '$lib/server/generateTone';
import {
	buildLandingPageIndexJson,
	mergeWebsiteDemoJsonWithGbp,
	narrowLandingPageJsonForApi
} from '$lib/server/buildLandingPageIndexJson';
import { enrichPitchRosettaCopy } from '$lib/server/enrichPitchRosettaCopy';
import { getDemoImageUrls } from '$lib/server/unsplash';
import { industryDisplayToSlug } from '$lib/industries';
import type { IndustrySlug } from '$lib/industries';
import type { LandingPageIndexJson } from '$lib/types/landingPageIndexJson';
import { DEMO_ERROR } from '$lib/constants/demoErrors';
import { serverError } from '$lib/server/logger';

export type ProcessJobResult =
	| { processed: true; jobId: string; prospectId: string; status: 'done'; demoLink: string; companyName?: string }
	| { processed: true; jobId: string; prospectId: string; status: 'failed'; errorMessage: string; companyName?: string }
	| { processed: true; jobId: string; prospectId: string; status: 'processing'; companyName?: string }
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
			const errorMessage = DEMO_ERROR.PROSPECT_NOT_FOUND;
			await updateDemoJob(jobId, { status: 'failed', errorMessage });
			await updateProspectStatus(prospectId, 'Prospect');
			serverError('processDemoJob', 'failed', { jobId, prospectId, errorCode: 'PROSPECT_NOT_FOUND', errorMessage });
			return { processed: true, jobId, prospectId, status: 'failed', errorMessage };
		}
		// Allow demo for "no online presence" (GBP failed, no valid website); we use name-based insight and stub GBP.
		if (prospect.flagged && prospect.flaggedReason !== NO_FIT_GBP_REASON) {
			const errorMessage = DEMO_ERROR.CLIENT_OUT_OF_SCOPE;
			await updateDemoJob(jobId, { status: 'failed', errorMessage });
			await updateProspectStatus(prospectId, 'Prospect');
			serverError('processDemoJob', 'failed', { jobId, prospectId, companyName: prospect.companyName, errorCode: 'CLIENT_OUT_OF_SCOPE', errorMessage });
			return {
				processed: true,
				jobId,
				prospectId,
				status: 'failed',
				errorMessage,
				companyName: prospect.companyName ?? undefined
			};
		}
		// If prospect already has a demo link, we still run generation (regenerate case); overwrites stored HTML.

		// Use scraped data from the qualifying (GBP) step only. No Pull insights / fetch in this step.
		const existingScraped = await getScrapedDataForProspectForUser(userId, prospectId);
		const hasUsableGbp =
			existingScraped &&
			typeof existingScraped === 'object' &&
			existingScraped.gbpRaw != null &&
			typeof existingScraped.gbpRaw === 'object';

		if (!hasUsableGbp) {
			const errorMessage =
				'Scraped data required. Complete the qualifying (GBP) step first, then generate the demo.';
			await updateDemoJob(jobId, { status: 'failed', errorMessage });
			await updateProspectStatus(prospectId, 'Prospect');
			serverError('processDemoJob', 'failed', { jobId, prospectId, companyName: prospect.companyName, errorMessage });
			return {
				processed: true,
				jobId,
				prospectId,
				status: 'failed',
				errorMessage,
				companyName: prospect.companyName ?? undefined
			};
		}

		const scrapedData = { ...existingScraped } as Record<string, unknown>;

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
			const errorMessage = DEMO_ERROR.GBP_DATA_REQUIRED;
			await updateDemoJob(jobId, { status: 'failed', errorMessage });
			await updateProspectStatus(prospectId, 'Prospect');
			serverError('processDemoJob', 'failed', { jobId, prospectId, companyName: prospect.companyName, errorCode: 'GBP_DATA_REQUIRED', errorMessage });
			return {
				processed: true,
				jobId,
				prospectId,
				status: 'failed',
				errorMessage,
				companyName: prospect.companyName ?? undefined
			};
		}

		const demoGeneratorUrl = (env.DEMO_GENERATOR_URL ?? '').trim();
		const demoGeneratorApiKey = (env.DEMO_GENERATOR_API_KEY ?? '').trim();
		const demoCallbackSecret = (env.DEMO_CALLBACK_SECRET ?? '').trim();

		if (!demoGeneratorUrl || !demoGeneratorApiKey || !demoCallbackSecret) {
			const errorMessage =
				'Demo generator not configured. Set DEMO_GENERATOR_URL, DEMO_GENERATOR_API_KEY, and DEMO_CALLBACK_SECRET.';
			await updateDemoJob(jobId, { status: 'failed', errorMessage });
			await updateProspectStatus(prospectId, 'Prospect');
			serverError('processDemoJob', 'missing demo generator config', { jobId, prospectId });
			return {
				processed: true,
				jobId,
				prospectId,
				status: 'failed',
				errorMessage,
				companyName: prospect.companyName ?? undefined
			};
		}

		// Insight (grade, summary, website grading) for richer copy; use existing or generate once
		const existingInsight = existingScraped && typeof existingScraped === 'object' && (existingScraped as Record<string, unknown>).insight;
		let insight: GeminiInsight | null =
			existingInsight && typeof existingInsight === 'object' ? (existingInsight as GeminiInsight) : null;
		if (!insight) {
			const insightResult = await generateInsightForProspect(prospect, gbpRaw as GbpData);
			if (insightResult.ok) insight = insightResult.data;
		}

		const industrySlug = industryDisplayToSlug(effectiveIndustry) as IndustrySlug;
		const imageUrls = await getDemoImageUrls(industrySlug, prospect.industry ?? undefined, {
			companyName: prospect.companyName ?? undefined
		});
		const existingDemoJson =
			existingScraped &&
			typeof existingScraped === 'object' &&
			(existingScraped as Record<string, unknown>).demoJson != null &&
			typeof (existingScraped as Record<string, unknown>).demoJson === 'object';
		let indexJson: LandingPageIndexJson;
		if (existingDemoJson) {
			indexJson = mergeWebsiteDemoJsonWithGbp({
				websiteDemoJson: (existingScraped as Record<string, unknown>).demoJson as LandingPageIndexJson,
				gbpRaw: gbpRaw as GbpData,
				prospect,
				industryLabel: effectiveIndustry,
				tone,
				imageUrls
			});
		} else {
			indexJson = buildLandingPageIndexJson({
				prospect,
				gbpRaw: gbpRaw as GbpData,
				industryLabel: effectiveIndustry,
				tone,
				imageUrls
			});
		}
		const enriched = await enrichPitchRosettaCopy(indexJson, prospect, gbpRaw as GbpData, insight);
		if (enriched.ok) indexJson = enriched.indexJson;
		const payload = narrowLandingPageJsonForApi(indexJson) as Record<string, unknown>;
		payload.id = prospectId;
		payload.jobId = jobId;
		payload.prospectId = prospectId;
		payload.userId = userId;
		payload.callbackUrl = `${origin.replace(/\/$/, '')}/api/demo/generation-callback`;
		payload.callbackToken = demoCallbackSecret;

		let res: Response;
		try {
			res = await fetch(`${demoGeneratorUrl.replace(/\/$/, '')}/api/generate-async`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${demoGeneratorApiKey}`
				},
				body: JSON.stringify(payload)
			});
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : String(err);
			await updateDemoJob(jobId, { status: 'failed', errorMessage });
			await updateProspectStatus(prospectId, 'Prospect');
			serverError('processDemoJob', 'generate-async request failed', { jobId, prospectId, errorMessage });
			return {
				processed: true,
				jobId,
				prospectId,
				status: 'failed',
				errorMessage,
				companyName: prospect.companyName ?? undefined
			};
		}

		if (res.status !== 202) {
			const text = await res.text().catch(() => '');
			const errorMessage = `Demo generator returned ${res.status}: ${text.slice(0, 200)}`;
			await updateDemoJob(jobId, { status: 'failed', errorMessage });
			await updateProspectStatus(prospectId, 'Prospect');
			serverError('processDemoJob', 'generate-async not 202', { jobId, prospectId, status: res.status });
			return {
				processed: true,
				jobId,
				prospectId,
				status: 'failed',
				errorMessage,
				companyName: prospect.companyName ?? undefined
			};
		}

		return {
			processed: true,
			jobId,
			prospectId,
			status: 'processing',
			companyName: prospect.companyName ?? undefined
		};
	} catch (e) {
		const errorMessage = e instanceof Error ? e.message : String(e);
		await updateDemoJob(jobId, { status: 'failed', errorMessage });
		await updateProspectStatus(prospectId, 'Prospect');
		serverError('processDemoJob', 'uncaught error', { jobId, prospectId, errorCode: 'UNCAUGHT', errorMessage, error: e });
		return { processed: true, jobId, prospectId, status: 'failed', errorMessage };
	}
}
