/**
 * Qualification logic for the pipeline: Qualify → Research & Personalize | No Fit.
 * - Qualify: run GBP; if GBP fails and no valid website → still move to next step when website is only a map link or missing (we generate AI demo from name/location).
 * - No Fit: only when GBP failed and we cannot generate a demo (e.g. manual out-of-scope).
 */

/** Reason stored in prospects.flagged_reason when sent to No Fit after GBP failure (legacy or manual). */
export const NO_FIT_GBP_REASON = 'No Fit – GBP not found; no valid website';

/** Reason when prospect is flagged as big corporation and moved straight to No Fit table. */
export const NO_FIT_BIG_CORP_REASON = 'Big corporation';

/**
 * True if the prospect has a usable website that is not just a Google Maps link.
 */
export function hasValidWebsiteNotMaps(website: string | null | undefined): boolean {
	const raw = (website ?? '').trim();
	if (!raw) return false;
	try {
		const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
		const host = url.hostname.toLowerCase().replace(/^www\./, '');
		if (host === 'maps.google.com' || host === 'google.com') return false;
		if (host === 'goo.gl' || host === 'google.gl') return false;
		const parts = host.split('.');
		if (parts.length < 2) return false;
		return true;
	} catch {
		return false;
	}
}

/**
 * True when the website is only a map/location link (e.g. Google Maps) or missing.
 * In that case we still move the prospect to the next step and generate an AI demo from name and location.
 */
export function isWebsiteOnlyMapOrMissing(website: string | null | undefined): boolean {
	return !hasValidWebsiteNotMaps(website);
}
