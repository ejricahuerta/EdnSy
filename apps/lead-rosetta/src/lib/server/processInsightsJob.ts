/**
 * Process one "Insights" job from the queue. Adds AI insight to existing GBP data in demo_tracking.
 * If prospect has no scraped_data (GBP), falls back to full getScrapedDataForDemo (GBP + insight) for backward compat.
 */

import { getProspectByIdForUser } from '$lib/server/prospects';
import {
	getDemoTrackingForProspect,
	claimNextPendingInsightsJob,
	updateInsightsJob,
	upsertDemoTrackingForProspect,
	updateDemoTrackingStatus,
	getScrapedDataForProspectForUser
} from '$lib/server/supabase';
import { getScrapedDataForDemo, getScrapedDataForDemoFromNameOnly, formatScrapedDataErrorMessage } from '$lib/server/gbp';
import { getGbpDefaultLocation } from '$lib/server/userSettings';
import { updateProspectFromGbp, updateProspectStatus } from '$lib/server/prospects';
import { isValidDemoTrackingStatus, type DemoTrackingStatus } from '$lib/demo';
import { generateInsightForProspect } from '$lib/server/insights';
import type { GbpData } from '$lib/server/gbp';
import { NO_FIT_GBP_REASON } from '$lib/server/qualify';
import { analyzeWebsiteAndProduceDemoJson } from '$lib/ai-agents';

const ANALYSIS_PLACEHOLDER_LINK = 'https://leadrosetta.local/analysis-pending';

export type ProcessInsightsJobResult =
	| { processed: true; prospectId: string; status: 'done'; companyName?: string }
	| { processed: true; prospectId: string; status: 'failed'; errorMessage: string; companyName?: string }
	| { processed: false };

export async function processOneInsightsJob(): Promise<ProcessInsightsJobResult> {
	const job = await claimNextPendingInsightsJob();
	if (!job) return { processed: false };

	const { id: jobId, user_id: userId, prospect_id: prospectId } = job;
	try {
		const prospect = await getProspectByIdForUser(userId, prospectId);
		if (!prospect) {
			const errorMessage = 'Prospect not found';
			await updateInsightsJob(jobId, { status: 'failed', errorMessage });
			await updateProspectStatus(prospectId, 'Prospect');
			return { processed: true, prospectId, status: 'failed', errorMessage };
		}
		// Allow "no online presence" (GBP failed, no valid website): we create name-based insight and demo.
		if (prospect.flagged && prospect.flaggedReason !== NO_FIT_GBP_REASON) {
			const errorMessage = 'Prospect is out of scope';
			await updateInsightsJob(jobId, { status: 'failed', errorMessage });
			await updateProspectStatus(prospectId, 'Prospect');
			return {
				processed: true,
				prospectId,
				status: 'failed',
				errorMessage,
				companyName: prospect.companyName ?? undefined
			};
		}

		const existingScraped = await getScrapedDataForProspectForUser(userId, prospectId);
		const hasGbpRaw =
			existingScraped &&
			typeof existingScraped === 'object' &&
			existingScraped.gbpRaw != null &&
			typeof (existingScraped as { gbpRaw?: unknown }).gbpRaw === 'object';

		let scrapedData: Record<string, unknown>;
		if (hasGbpRaw) {
			const gbp = (existingScraped as { gbpRaw: GbpData }).gbpRaw;
			const insightResult = await generateInsightForProspect(prospect, gbp);
			if (!insightResult.ok) {
				const errorMessage = insightResult.error ?? 'AI insight failed';
				await updateInsightsJob(jobId, { status: 'failed', errorMessage });
				await updateProspectStatus(prospectId, 'Prospect');
				return {
					processed: true,
					prospectId,
					status: 'failed',
					errorMessage,
					companyName: prospect.companyName ?? undefined
				};
			}
			scrapedData = { ...existingScraped, insight: insightResult.data } as Record<string, unknown>;
			// When prospect has a website, run website agent and store analysis + demoJson
			if (prospect.website?.trim().startsWith('http')) {
				const gbpSummary = existingScraped && typeof existingScraped === 'object' && (existingScraped as { gbpRaw?: GbpData }).gbpRaw
					? { name: (existingScraped as { gbpRaw: GbpData }).gbpRaw.name, address: (existingScraped as { gbpRaw: GbpData }).gbpRaw.address, category: (existingScraped as { gbpRaw: GbpData }).gbpRaw.industry }
					: undefined;
				const websiteResult = await analyzeWebsiteAndProduceDemoJson({
					websiteUrl: prospect.website.trim(),
					prospect,
					gbpSummary
				});
				if (websiteResult.ok) {
					scrapedData.websiteAnalysis = {
						uiGrade: websiteResult.data.uiGrade,
						uxGrade: websiteResult.data.uxGrade,
						funnelGrade: websiteResult.data.funnelGrade,
						seoGrade: websiteResult.data.seoGrade,
						overallGrade: websiteResult.data.overallGrade,
						...(websiteResult.data.funnelSummary != null && { funnelSummary: websiteResult.data.funnelSummary })
					};
					if (websiteResult.data.demoJson != null) {
						scrapedData.demoJson = websiteResult.data.demoJson;
					}
				}
			}
		} else {
			// No existing GBP: for "no online presence" use name-only; otherwise try GBP then fall back to name-only.
			const useNameOnly =
				prospect.flagged === true && prospect.flaggedReason === NO_FIT_GBP_REASON;
			let scrapedResult: Awaited<ReturnType<typeof getScrapedDataForDemo>> | Awaited<ReturnType<typeof getScrapedDataForDemoFromNameOnly>>;
			let fromRealGbp = false;

			if (useNameOnly) {
				scrapedResult = await getScrapedDataForDemoFromNameOnly(prospect);
			} else {
				const defaultLocation = await getGbpDefaultLocation(userId);
				scrapedResult = await getScrapedDataForDemo(prospect, {
					defaultLocation: defaultLocation ?? undefined
				});
				if (scrapedResult.ok) fromRealGbp = true;
				else if (scrapedResult.errors?.dataforseo) {
					// If GBP failed (e.g. DataForSEO error), fall back to name-based insight so we can still create a demo.
					scrapedResult = await getScrapedDataForDemoFromNameOnly(prospect);
				}
			}

			if (!scrapedResult.ok) {
				const errorMessage = formatScrapedDataErrorMessage(scrapedResult.errors);
				await updateInsightsJob(jobId, { status: 'failed', errorMessage });
				await updateProspectStatus(prospectId, 'Prospect');
				return {
					processed: true,
					prospectId,
					status: 'failed',
					errorMessage,
					companyName: prospect.companyName ?? undefined
				};
			}
			scrapedData = scrapedResult.data as Record<string, unknown>;
			const gbpFromResult = (scrapedResult.data as { gbpRaw?: GbpData }).gbpRaw;
			if (fromRealGbp && gbpFromResult) {
				await updateProspectFromGbp(prospectId, gbpFromResult);
			}
			// When prospect has a website, run website agent and store analysis + demoJson
			if (prospect.website?.trim().startsWith('http')) {
				const gbpSummary = gbpFromResult
					? { name: gbpFromResult.name, address: gbpFromResult.address, category: gbpFromResult.industry }
					: undefined;
				const websiteResult = await analyzeWebsiteAndProduceDemoJson({
					websiteUrl: prospect.website.trim(),
					prospect,
					gbpSummary
				});
				if (websiteResult.ok) {
					scrapedData.websiteAnalysis = {
						uiGrade: websiteResult.data.uiGrade,
						uxGrade: websiteResult.data.uxGrade,
						funnelGrade: websiteResult.data.funnelGrade,
						seoGrade: websiteResult.data.seoGrade,
						overallGrade: websiteResult.data.overallGrade,
						...(websiteResult.data.funnelSummary != null && { funnelSummary: websiteResult.data.funnelSummary })
					};
					if (websiteResult.data.demoJson != null) {
						scrapedData.demoJson = websiteResult.data.demoJson;
					}
				}
			}
		}

		const existingRow = await getDemoTrackingForProspect(userId, prospectId);
		const status: DemoTrackingStatus =
			existingRow?.status && isValidDemoTrackingStatus(existingRow.status)
				? (existingRow.status as DemoTrackingStatus)
				: 'draft';
		if (!existingRow) {
			await upsertDemoTrackingForProspect(
				userId,
				prospectId,
				prospect.provider ?? 'manual',
				prospect.provider_row_id ?? prospectId,
				ANALYSIS_PLACEHOLDER_LINK,
				'draft'
			);
		}
		const updateResult = await updateDemoTrackingStatus(userId, prospectId, {
			status,
			scrapedData
		});
		if (!updateResult.ok) {
			const errorMessage = updateResult.error ?? 'Failed to save analysis';
			await updateInsightsJob(jobId, { status: 'failed', errorMessage });
			return {
				processed: true,
				prospectId,
				status: 'failed',
				errorMessage,
				companyName: prospect.companyName ?? undefined
			};
		}

		await updateInsightsJob(jobId, { status: 'done' });
		await updateProspectStatus(prospectId, 'Generate Demo');
		return {
			processed: true,
			prospectId,
			status: 'done',
			companyName: prospect.companyName ?? undefined
		};
	} catch (e) {
		const errorMessage = e instanceof Error ? e.message : String(e);
		await updateInsightsJob(jobId, { status: 'failed', errorMessage });
		await updateProspectStatus(prospectId, 'Prospect');
		return { processed: true, prospectId, status: 'failed', errorMessage };
	}
}
