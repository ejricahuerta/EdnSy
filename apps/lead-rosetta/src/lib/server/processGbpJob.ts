/**
 * Process one GBP (Google Business Profile) job from the queue. Fetches GBP data and runs AI grading when Gemini is configured.
 *
 * Pipeline: Qualify (GBP) → Research & Personalize (Generate Demo).
 * - Fetches GBP (Places API), builds audit, then calls Gemini to grade the business and attach insight (grade, summary, recommendations).
 * - If GBP fails: when website is only a map link or missing, move to next step (Generate Demo) and do not flag.
 *   We generate a generic AI demo from business name and location. Only flag when explicitly out of scope.
 */

import { getProspectByIdForUser, updateProspectFromGbp, updateProspectStatus, setProspectFlagged } from '$lib/server/prospects';
import {
	getDemoTrackingForProspect,
	claimNextPendingGbpJob,
	updateGbpJob,
	upsertDemoTrackingForProspect,
	updateDemoTrackingStatus
} from '$lib/server/supabase';
import { fetchGbpForProspect, buildAuditFromGbp } from '$lib/server/gbp';
import { getGbpDefaultLocation } from '$lib/server/userSettings';
import { isValidDemoTrackingStatus, type DemoTrackingStatus } from '$lib/demo';
import { generateInsightForProspect } from '$lib/server/insights';
import { gradeGbp } from '$lib/ai-agents';
import { isOutOfScopeCompany } from '$lib/server/outOfScope';
import { NO_FIT_BIG_CORP_REASON } from '$lib/server/qualify';

const ANALYSIS_PLACEHOLDER_LINK = 'https://leadrosetta.local/analysis-pending';

export type ProcessGbpJobResult =
	| { processed: true; prospectId: string; status: 'done'; companyName?: string }
	| { processed: true; prospectId: string; status: 'failed'; errorMessage: string; companyName?: string }
	| { processed: false };

export async function processOneGbpJob(): Promise<ProcessGbpJobResult> {
	const job = await claimNextPendingGbpJob();
	if (!job) return { processed: false };

	const { id: jobId, user_id: userId, prospect_id: prospectId } = job;
	try {
		const prospect = await getProspectByIdForUser(userId, prospectId);
		if (!prospect) {
			const errorMessage = 'Prospect not found';
			await updateGbpJob(jobId, { status: 'failed', errorMessage });
			await updateProspectStatus(prospectId, 'Prospect');
			return { processed: true, prospectId, status: 'failed', errorMessage };
		}
		if (prospect.flagged) {
			const errorMessage = 'Prospect is out of scope';
			await updateGbpJob(jobId, { status: 'failed', errorMessage });
			await updateProspectStatus(prospectId, 'Prospect');
			return {
				processed: true,
				prospectId,
				status: 'failed',
				errorMessage,
				companyName: prospect.companyName ?? undefined
			};
		}

		const defaultLocation = await getGbpDefaultLocation(userId);
		const gbpResult = await fetchGbpForProspect(prospect, {
			defaultLocation: defaultLocation ?? undefined
		});
		if (!gbpResult.ok) {
			await updateGbpJob(jobId, { status: 'failed', errorMessage: gbpResult.error });
			// When GBP fails: move to next step (Generate Demo) so we can create a generic AI demo
			// from business name and location (website is map-only or missing). Do not flag.
			await updateProspectStatus(prospectId, 'Generate Demo');
			return {
				processed: true,
				prospectId,
				status: 'failed',
				errorMessage: gbpResult.error,
				companyName: prospect.companyName ?? undefined
			};
		}

		const gbp = gbpResult.data;

		// Big corporations: flag and send straight to No Fit table (no demo, no further processing).
		if (isOutOfScopeCompany(prospect.companyName) || isOutOfScopeCompany(gbp.name)) {
			await setProspectFlagged(userId, prospectId, true, NO_FIT_BIG_CORP_REASON);
			await updateGbpJob(jobId, { status: 'failed', errorMessage: 'Big corporation – moved to No Fit' });
			await updateProspectStatus(prospectId, 'Prospect');
			return {
				processed: true,
				prospectId,
				status: 'failed',
				errorMessage: 'Big corporation – moved to No Fit',
				companyName: prospect.companyName ?? gbp.name
			};
		}

		await updateProspectFromGbp(prospectId, gbp);

		const baseAudit = buildAuditFromGbp(gbp, prospect);
		const gbpGradeResult = await gradeGbp(gbp, prospect);
		const auditFromGbp = gbpGradeResult.ok
			? {
					...baseAudit,
					gbpCompletenessScore: gbpGradeResult.data.score,
					gbpCompletenessLabel: gbpGradeResult.data.label
				}
			: baseAudit;
		const insightResult = await generateInsightForProspect(prospect, gbp);
		const scrapedData = {
			...auditFromGbp,
			...(gbpGradeResult.ok ? { gbpGrade: gbpGradeResult.data } : {}),
			...(insightResult.ok ? { insight: insightResult.data } : {})
		} as Record<string, unknown>;

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
			const errorMessage = updateResult.error ?? 'Failed to save GBP data';
			await updateGbpJob(jobId, { status: 'failed', errorMessage });
			await updateProspectStatus(prospectId, 'Prospect');
			return {
				processed: true,
				prospectId,
				status: 'failed',
				errorMessage,
				companyName: prospect.companyName ?? undefined
			};
		}

		await updateGbpJob(jobId, { status: 'done' });
		await updateProspectStatus(prospectId, 'Generate Demo');
		return {
			processed: true,
			prospectId,
			status: 'done',
			companyName: prospect.companyName ?? undefined
		};
	} catch (e) {
		const errorMessage = e instanceof Error ? e.message : String(e);
		await updateGbpJob(jobId, { status: 'failed', errorMessage });
		await updateProspectStatus(prospectId, 'Prospect');
		return { processed: true, prospectId, status: 'failed', errorMessage };
	}
}
