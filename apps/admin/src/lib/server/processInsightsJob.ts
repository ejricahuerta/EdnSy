/**
 * Process one "Insights" job from the queue.
 *
 * Pipeline: data sync → [ GBP → website → industry → insight ] → demo
 * This job does website → industry → insight (and GBP if not already present).
 * Order: 1) GBP (if missing), 2) website analysis, 3) infer industry + persist, 4) generate insight.
 */

import { getProspectByIdForUser, updateProspectFromGbp, updateProspectStatus, updateProspectIndustry } from '$lib/server/prospects';
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
import { isValidDemoTrackingStatus, type DemoTrackingStatus } from '$lib/demo';
import { generateInsightForProspect, generateInsightFromBusinessName, inferIndustryWithGemini } from '$lib/server/insights';
import type { GbpData } from '$lib/server/gbp';
import { NO_FIT_GBP_REASON } from '$lib/server/qualify';
import { analyzeWebsiteAndProduceDemoJson } from '$lib/ai-agents';
import { normalizeExternalHref } from '$lib/externalUrl';
import { notionIndustryToSlug } from '$lib/industryMapping';
import { INDUSTRY_LABELS } from '$lib/industries';
import { PROSPECT_STATUS } from '$lib/prospectStatus';

const ANALYSIS_PLACEHOLDER_LINK = 'https://admin.local/analysis-pending';

/** Merge an inferred industry with current (e.g. "" + "Dental" → "Dental"). Dedupes and trims. */
function mergeIndustryValues(current: string, toAdd: string): string {
	const parts = (current ?? '').split(',').map((s) => s.trim()).filter(Boolean);
	const add = (toAdd ?? '').trim();
	if (!add) return parts.join(', ');
	if (parts.some((p) => p.toLowerCase() === add.toLowerCase())) return parts.join(', ');
	parts.push(add);
	return parts.join(', ').slice(0, 200);
}

/** When Gemini inference returns null, derive industry from GBP category so we never leave it empty. */
function industryLabelFromGbpCategory(gbpCategory: string | null | undefined): string | null {
	const raw = (gbpCategory ?? '').trim();
	if (!raw) return null;
	const slug = notionIndustryToSlug(raw);
	return INDUSTRY_LABELS[slug];
}

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
			await updateProspectStatus(prospectId, PROSPECT_STATUS.NEW);
			return { processed: true, prospectId, status: 'failed', errorMessage };
		}
		// Allow "no online presence" (GBP failed, no valid website): we create name-based insight and demo.
		if (prospect.flagged && prospect.flaggedReason !== NO_FIT_GBP_REASON) {
			const errorMessage = 'Prospect is out of scope';
			await updateInsightsJob(jobId, { status: 'failed', errorMessage });
			await updateProspectStatus(prospectId, PROSPECT_STATUS.NEW);
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
			// Flow: GBP (already present) → website → industry → insight
			const gbp = (existingScraped as { gbpRaw: GbpData }).gbpRaw;
			scrapedData = { ...existingScraped } as Record<string, unknown>;
			// Step 2: website (CRM may store domain without scheme)
			const websiteUrlForFetch = normalizeExternalHref(prospect.website);
			if (websiteUrlForFetch && /^https?:\/\//i.test(websiteUrlForFetch)) {
				const gbpSummary = { name: gbp.name, address: gbp.address, category: gbp.industry };
				const websiteResult = await analyzeWebsiteAndProduceDemoJson({
					websiteUrl: websiteUrlForFetch,
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
			// Step 3: industry (infer from GBP + website context, persist)
			let prospectForInsight = prospect;
			const inferred = await inferIndustryWithGemini(prospect, gbp?.industry ?? null);
			if (inferred) {
				const merged = mergeIndustryValues((prospect.industry ?? '').trim(), inferred);
				const updated = await updateProspectIndustry(prospectId, merged);
				if (updated.ok) {
					const refetched = await getProspectByIdForUser(userId, prospectId);
					if (refetched) prospectForInsight = refetched;
				}
			} else if (!(prospect.industry ?? '').trim()) {
				// Fallback: Gemini returned null; derive from GBP category so we never leave industry empty
				const fallbackLabel = industryLabelFromGbpCategory(gbp?.industry ?? null);
				if (fallbackLabel) {
					const updated = await updateProspectIndustry(prospectId, fallbackLabel);
					if (updated.ok) {
						const refetched = await getProspectByIdForUser(userId, prospectId);
						if (refetched) prospectForInsight = refetched;
					}
				}
			}
			// Step 4: insight (uses prospect with industry set)
			const insightResult = await generateInsightForProspect(prospectForInsight, gbp);
			if (!insightResult.ok) {
				const errorMessage = insightResult.error ?? 'AI insight failed';
				await updateInsightsJob(jobId, { status: 'failed', errorMessage });
				await updateProspectStatus(prospectId, PROSPECT_STATUS.NEW);
				return {
					processed: true,
					prospectId,
					status: 'failed',
					errorMessage,
					companyName: prospect.companyName ?? undefined
				};
			}
			scrapedData.insight = insightResult.data;
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
				await updateProspectStatus(prospectId, PROSPECT_STATUS.NEW);
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
			// Step 1 (GBP): already done above; enrich prospect from GBP
			if (fromRealGbp && gbpFromResult) {
				await updateProspectFromGbp(prospectId, gbpFromResult);
			}
			// Step 2: website (CRM may store domain without scheme)
			const websiteUrlForFetch2 = normalizeExternalHref(prospect.website);
			if (websiteUrlForFetch2 && /^https?:\/\//i.test(websiteUrlForFetch2)) {
				const gbpSummary = gbpFromResult
					? { name: gbpFromResult.name, address: gbpFromResult.address, category: gbpFromResult.industry }
					: undefined;
				const websiteResult = await analyzeWebsiteAndProduceDemoJson({
					websiteUrl: websiteUrlForFetch2,
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
			// Step 3: industry (infer from GBP + website context, persist)
			let prospectForInsight = prospect;
			const inferred = await inferIndustryWithGemini(prospect, gbpFromResult?.industry ?? null);
			if (inferred) {
				const merged = mergeIndustryValues((prospect.industry ?? '').trim(), inferred);
				const updated = await updateProspectIndustry(prospectId, merged);
				if (updated.ok) {
					const refetched = await getProspectByIdForUser(userId, prospectId);
					if (refetched) prospectForInsight = refetched;
				}
			} else if (!(prospect.industry ?? '').trim()) {
				// Fallback: Gemini returned null; derive from GBP category so we never leave industry empty
				const fallbackLabel = industryLabelFromGbpCategory(gbpFromResult?.industry ?? null);
				if (fallbackLabel) {
					const updated = await updateProspectIndustry(prospectId, fallbackLabel);
					if (updated.ok) {
						const refetched = await getProspectByIdForUser(userId, prospectId);
						if (refetched) prospectForInsight = refetched;
					}
				}
			}
			// Step 4: insight (uses prospect with industry set when available)
			const insightResult = gbpFromResult
				? await generateInsightForProspect(prospectForInsight, gbpFromResult)
				: await generateInsightFromBusinessName(prospectForInsight);
			if (!insightResult.ok) {
				const errorMessage = insightResult.error ?? 'AI insight failed';
				await updateInsightsJob(jobId, { status: 'failed', errorMessage });
				await updateProspectStatus(prospectId, PROSPECT_STATUS.NEW);
				return {
					processed: true,
					prospectId,
					status: 'failed',
					errorMessage,
					companyName: prospect.companyName ?? undefined
				};
			}
			scrapedData.insight = insightResult.data;
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
		await updateProspectStatus(prospectId, PROSPECT_STATUS.DEMO_PENDING);
		return {
			processed: true,
			prospectId,
			status: 'done',
			companyName: prospect.companyName ?? undefined
		};
	} catch (e) {
		const errorMessage = e instanceof Error ? e.message : String(e);
		await updateInsightsJob(jobId, { status: 'failed', errorMessage });
		await updateProspectStatus(prospectId, PROSPECT_STATUS.NEW);
		return { processed: true, prospectId, status: 'failed', errorMessage };
	}
}
