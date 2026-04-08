import type { IndustrySlug } from '$lib/industries';
import { apifyResultsToProspects, type ApifyProspectFields } from '$lib/server/apify';
import { insertProspectIfAbsent } from '$lib/server/prospects';

export type ImportApifyResult = {
	inserted: number;
	skipped: number;
	failed: number;
	errors: string[];
};

export async function importProspectsFromApifyDataset(
	userId: string,
	items: unknown[],
	industrySlug: IndustrySlug
): Promise<ImportApifyResult> {
	const rows = apifyResultsToProspects(items, userId, industrySlug);
	const errors: string[] = [];
	let inserted = 0;
	let skipped = 0;
	let failed = 0;
	for (let i = 0; i < rows.length; i++) {
		const fields: ApifyProspectFields = rows[i]!;
		const r = await insertProspectIfAbsent(userId, 'apify', fields.providerRowId, {
			companyName: fields.companyName,
			email: fields.email,
			website: fields.website,
			phone: fields.phone,
			industry: fields.industry
		});
		if (r.error) {
			failed++;
			errors.push(`Row ${i + 1} (${fields.companyName}): ${r.error}`);
			if (errors.length >= 8) break;
		} else if (r.inserted) {
			inserted++;
		} else {
			skipped++;
		}
	}
	return { inserted, skipped, failed, errors };
}
