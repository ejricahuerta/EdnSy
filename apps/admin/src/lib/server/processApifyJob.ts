/**
 * Process one Apify bulk-import job: run Google Maps scraper and insert prospects.
 */

import { INDUSTRY_SLUGS, type IndustrySlug } from '$lib/industries';
import { buildApifyPayload, runApifyGoogleMapsScraper } from '$lib/server/apify';
import { importProspectsFromApifyDataset } from '$lib/server/apifyImport';
import { claimNextPendingApifyJob, updateApifyJob } from '$lib/server/supabase';

export type ProcessApifyJobResult =
	| { processed: true; jobId: string; status: 'done'; inserted: number; skipped: number; failed: number }
	| { processed: true; jobId: string; status: 'failed'; errorMessage: string }
	| { processed: false };

function parseIndustrySlug(raw: string): IndustrySlug {
	const t = (raw ?? '').trim().toLowerCase();
	if (INDUSTRY_SLUGS.includes(t as IndustrySlug)) return t as IndustrySlug;
	return 'other';
}

export async function processOneApifyJob(): Promise<ProcessApifyJobResult> {
	const job = await claimNextPendingApifyJob();
	if (!job) return { processed: false };

	const { id: jobId, user_id: userId, industry: industryRaw, location } = job;
	const industrySlug = parseIndustrySlug(industryRaw);

	try {
		const payload = buildApifyPayload(industrySlug, location);
		const run = await runApifyGoogleMapsScraper(payload);
		if (!run.ok) {
			await updateApifyJob(jobId, { status: 'failed', errorMessage: run.error });
			return { processed: true, jobId, status: 'failed', errorMessage: run.error };
		}

		const importResult = await importProspectsFromApifyDataset(userId, run.items, industrySlug);
		await updateApifyJob(jobId, {
			status: 'done',
			insertedCount: importResult.inserted,
			errorMessage: null
		});
		return {
			processed: true,
			jobId,
			status: 'done',
			inserted: importResult.inserted,
			skipped: importResult.skipped,
			failed: importResult.failed
		};
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		await updateApifyJob(jobId, { status: 'failed', errorMessage: msg });
		return { processed: true, jobId, status: 'failed', errorMessage: msg };
	}
}
