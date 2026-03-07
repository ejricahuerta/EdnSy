/**
 * Central demo error codes and user-facing messages.
 * Use these in processDemoJob, claudeGenerateDemoHtml, part routes, and dashboard so failures show specific labels.
 */

export const DEMO_ERROR = {
	// Job preconditions
	PROSPECT_NOT_FOUND: 'Prospect not found',
	CLIENT_OUT_OF_SCOPE: 'Client is out of scope',
	SCRAPED_DATA_REQUIRED:
		'Scraped data required. Complete the qualifying (GBP) step first, then generate the demo.',
	GBP_DATA_REQUIRED: 'GBP data is required to generate a demo. Run "Pull insights" first.',

	// In-app generation (legacy three-part)
	API_KEY_MISSING: 'CLAUDE_API_KEY (or ANTHROPIC_API_KEY) not configured',
	PART_1_FAILED: 'Part 1 (head, nav, hero) failed',
	PART_2_FAILED: 'Part 2 (services, about, stats) failed',
	PART_3_FAILED: 'Part 3 (testimonials, gallery, contact, footer) failed',
	PART_1_INVALID: 'Part 1 must not include </body> or </html>.',
	PART_3_INVALID: 'Part 3 must end with </body></html>.',
	NO_HTML_RETURNED: 'Claude did not return valid HTML',
	RATE_LIMITED: 'Rate limited; try again in a minute',

	// Storage / upload
	UPLOAD_PARTS_FAILED: 'Failed to save demo parts to storage',
	UPLOAD_LEGACY_FAILED: 'Failed to save demo to storage',
	SUPABASE_NOT_CONFIGURED: 'Supabase not configured',
	PART_DOWNLOAD_FAILED: 'Demo part could not be loaded',

	// Prospect / tracking
	UPDATE_PROSPECT_FAILED: 'Failed to update prospect',
	DEMO_NOT_FOUND: 'Demo content not found',
	PART_NOT_FOUND: 'Part not found',
	UNAVAILABLE: 'Unavailable',

	// Viewing (demo page / iframe)
	DEMO_PAGE_LOAD_FAILED: 'Demo page failed to load',
	DEMO_PAGE_BLANK: 'This demo didn’t load properly.',
	DEMO_PAGE_UNAVAILABLE: 'This demo isn’t available.',
	DEMO_PAGE_PARTS_FAILED: 'One or more demo sections failed to load. Try again.',
	DEMO_STILL_GENERATING: 'The demo may still be generating, or the link may have expired.',
} as const;

export type DemoErrorCode = keyof typeof DEMO_ERROR;

/** User-facing message for a given code (same as value; use for consistency). */
export function getDemoErrorMessage(code: DemoErrorCode): string {
	return DEMO_ERROR[code];
}

/**
 * Short label for dashboard status column when demo job failed.
 * Maps known error message substrings to a concise label.
 */
export function getDemoFailureLabel(errorMessage: string | undefined): string {
	const msg = (errorMessage ?? '').trim();
	if (!msg) return 'Demo creation error';

	// GBP / qualifying
	if (/prospect not found/i.test(msg)) return 'Prospect not found';
	if (/out of scope|client is out of scope/i.test(msg)) return 'Out of scope';
	if (/scraped data|qualifying|GBP.*first/i.test(msg)) return 'Run qualifying first';
	if (/GBP data|Pull insights/i.test(msg)) return 'Run Pull insights first';

	// In-app parts (legacy)
	if (/Part 1:/i.test(msg) || /part 1/i.test(msg)) return 'Part 1 failed';
	if (/Part 2:/i.test(msg) || /part 2/i.test(msg)) return 'Part 2 failed';
	if (/Part 3:/i.test(msg) || /part 3/i.test(msg)) return 'Part 3 failed';
	if (/rate limit|429/i.test(msg)) return 'Rate limited';
	if (/API.*key|not configured/i.test(msg)) return 'API key missing';

	// Storage
	if (/save demo parts|upload.*part/i.test(msg)) return 'Storage (parts) failed';
	if (/save demo to storage|upload.*failed/i.test(msg)) return 'Storage failed';
	if (/Supabase not configured/i.test(msg)) return 'Storage not configured';

	// Other
	if (/update prospect|Failed to update/i.test(msg)) return 'Update prospect failed';

	return 'Demo creation error';
}
