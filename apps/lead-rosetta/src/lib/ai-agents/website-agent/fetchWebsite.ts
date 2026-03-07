/**
 * Fetch website content (HTML + stripped text). Used by the website agent and by generateAudit for insight/audit.
 * HTTP fetch, strip scripts/styles, extract plain text; single implementation to avoid duplication.
 */

const DEFAULT_MAX_CHARS = 8000;
const DEFAULT_TIMEOUT_MS = 8000;
const USER_AGENT = 'LeadRosetta/1.0 (website analysis)';

export type FetchWebsiteContentResult =
	| { ok: true; html: string; text: string }
	| { ok: false; error: string };

/**
 * Fetch a URL and return HTML and plain-text content (script/style stripped). For use by the website agent.
 */
export async function fetchWebsiteContent(
	url: string,
	options?: { maxChars?: number; timeoutMs?: number }
): Promise<FetchWebsiteContentResult> {
	const maxChars = options?.maxChars ?? DEFAULT_MAX_CHARS;
	const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
	try {
		const res = await fetch(url, {
			headers: { 'User-Agent': USER_AGENT },
			signal: AbortSignal.timeout(timeoutMs)
		});
		if (!res.ok) {
			return { ok: false, error: `HTTP ${res.status}` };
		}
		const html = await res.text();
		const text = html
			.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
			.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
			.replace(/<[^>]+>/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
		const truncated = text.slice(0, maxChars) || '';
		return { ok: true, html, text: truncated };
	} catch (e) {
		const err = e instanceof Error ? e.message : String(e);
		return { ok: false, error: err };
	}
}
