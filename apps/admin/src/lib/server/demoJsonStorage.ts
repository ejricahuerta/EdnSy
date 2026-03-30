/**
 * Store and retrieve demo page JSON and demo content/HTML in Supabase Storage (admin-ednsy-bucket).
 * - demo-json/{prospectId}.json — page data
 * - demo-html/{prospectId}.html — pre-rendered website HTML (optional)
 * - demo-html/{prospectId}.txt — plain text or markdown; converted to HTML when pulled
 */

import { marked } from 'marked';
import { getSupabaseAdmin } from '$lib/server/supabase';
import { serverError } from '$lib/server/logger';
import type { DemoPageJson } from '$lib/types/demoPageJson';

const BUCKET = 'admin-ednsy-bucket';
const FOLDER = 'demo-json';
const DEMO_HTML_FOLDER = 'demo-html';
const DEMO_CONTENT_EXT = '.txt';

/**
 * Upload demo page JSON to Supabase Storage at demo-json/{prospectId}.json.
 * Uses service role; overwrites if file exists (upsert).
 * Returns { ok: true } or { ok: false, error: string }.
 */
export async function uploadDemoPageJson(
	prospectId: string,
	pageJson: DemoPageJson
): Promise<{ ok: true } | { ok: false; error: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) {
		return { ok: false, error: 'Supabase not configured' };
	}

	const path = `${FOLDER}/${prospectId}.json`;
	const body = new TextEncoder().encode(JSON.stringify(pageJson, null, 2));

	try {
		const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
			contentType: 'application/json',
			upsert: true
		});
		if (error) {
			serverError('demoJsonStorage', 'upload failed', { prospectId, error: error.message });
			return { ok: false, error: error.message };
		}
		return { ok: true };
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		serverError('demoJsonStorage', 'upload error', { prospectId, msg });
		return { ok: false, error: msg };
	}
}

/**
 * Get the storage path for a demo's JSON file (for reference or public URL if bucket is public).
 */
export function getDemoJsonStoragePath(prospectId: string): string {
	return `${FOLDER}/${prospectId}.json`;
}

/**
 * Upload demo website HTML to Supabase Storage at demo-html/{prospectId}.html.
 * Use when you have pre-rendered HTML. Overwrites if file exists (upsert).
 */
export async function uploadDemoHtml(
	prospectId: string,
	html: string
): Promise<{ ok: true } | { ok: false; error: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) {
		return { ok: false, error: 'Supabase not configured' };
	}

	const path = `${DEMO_HTML_FOLDER}/${prospectId}.html`;
	const body = new TextEncoder().encode(html);

	try {
		const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
			contentType: 'text/html; charset=utf-8',
			upsert: true
		});
		if (error) {
			serverError('demoStorage', 'HTML upload failed', { prospectId, error: error.message });
			return { ok: false, error: error.message };
		}
		return { ok: true };
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		serverError('demoStorage', 'HTML upload error', { prospectId, msg });
		return { ok: false, error: msg };
	}
}

/**
 * Upload demo content as plain text or markdown to Supabase Storage at demo-html/{prospectId}.txt.
 * When pulled via downloadDemoHtml, this content is converted to HTML (markdown parsed, then wrapped in a minimal document).
 * Use when the generator outputs text only; HTML is produced at read time.
 */
export async function uploadDemoContent(
	prospectId: string,
	content: string
): Promise<{ ok: true } | { ok: false; error: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) {
		return { ok: false, error: 'Supabase not configured' };
	}

	const path = `${DEMO_HTML_FOLDER}/${prospectId}${DEMO_CONTENT_EXT}`;
	const body = new TextEncoder().encode(content);

	try {
		const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
			contentType: 'text/plain; charset=utf-8',
			upsert: true
		});
		if (error) {
			serverError('demoStorage', 'content upload failed', { prospectId, error: error.message });
			return { ok: false, error: error.message };
		}
		return { ok: true };
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		serverError('demoStorage', 'content upload error', { prospectId, msg });
		return { ok: false, error: msg };
	}
}

/**
 * Get the storage path for a demo's HTML file (for reference or public URL if bucket is public).
 */
export function getDemoHtmlStoragePath(prospectId: string): string {
	return `${DEMO_HTML_FOLDER}/${prospectId}.html`;
}

/** Storage path for a legacy three-part demo HTML part (1, 2, or 3). */
export function getDemoHtmlPartPath(prospectId: string, part: 1 | 2 | 3): string {
	return `${DEMO_HTML_FOLDER}/${prospectId}-part${part}.html`;
}

/**
 * Upload one part of a legacy three-part demo HTML. Overwrites if exists.
 */
export async function uploadDemoHtmlPart(
	prospectId: string,
	part: 1 | 2 | 3,
	html: string
): Promise<{ ok: true } | { ok: false; error: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { ok: false, error: 'Supabase not configured' };
	const path = getDemoHtmlPartPath(prospectId, part);
	const body = new TextEncoder().encode(html);
	try {
		const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
			contentType: 'text/html; charset=utf-8',
			upsert: true
		});
		if (error) {
			serverError('demoStorage', 'part upload failed', { prospectId, part, error: error.message });
			return { ok: false, error: error.message };
		}
		return { ok: true };
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		serverError('demoStorage', 'part upload error', { prospectId, part, msg });
		return { ok: false, error: msg };
	}
}

/**
 * Download one part of a legacy three-part demo HTML. Returns null if missing or error. Never throws.
 */
export async function downloadDemoHtmlPart(prospectId: string, part: 1 | 2 | 3): Promise<string | null> {
	try {
		const supabase = getSupabaseAdmin();
		if (!supabase) return null;
		const path = getDemoHtmlPartPath(prospectId, part);
		const { data, error } = await supabase.storage.from(BUCKET).download(path);
		if (error || !data) return null;
		const text = await data.text();
		return text ?? null;
	} catch (e) {
		serverError('demoStorage', 'downloadDemoHtmlPart error', { prospectId, part, error: e instanceof Error ? e.message : String(e) });
		return null;
	}
}

/**
 * Get the storage path for a demo's text/markdown content file.
 */
export function getDemoContentStoragePath(prospectId: string): string {
	return `${DEMO_HTML_FOLDER}/${prospectId}${DEMO_CONTENT_EXT}`;
}

/**
 * Extract head inner HTML from a full document (for link/style so demo CSS applies when rendering inline).
 * If no <head> is found, returns empty string.
 */
export function extractHeadHtml(fullHtml: string): string {
	const headMatch = fullHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
	return headMatch ? headMatch[1].trim() : '';
}

/**
 * Extract body inner HTML from a full document string for safe inline injection.
 * If no <body> is found, returns the original string.
 */
export function extractBodyHtml(fullHtml: string): string {
	const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
	return bodyMatch ? bodyMatch[1].trim() : fullHtml;
}

/**
 * Download demo website HTML from Supabase Storage. Returns the HTML string or null if missing/error.
 * - Prefer demo-html/{prospectId}.html (single file from website-template or in-app).
 * - Else if legacy three-part demo exists (part1, part2, part3), stitch and return.
 * - Else if demo-html/{prospectId}.txt exists, convert markdown to HTML and return.
 */
export async function downloadDemoHtml(prospectId: string): Promise<string | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;

	// Prefer single file (website-template or any single-file generator)
	const htmlPath = getDemoHtmlStoragePath(prospectId);
	const { data: htmlData, error: htmlError } = await supabase.storage.from(BUCKET).download(htmlPath);
	if (!htmlError && htmlData) {
		return htmlData.text();
	}

	// Legacy three-part demo (stitch server-side)
	const [p1, p2, p3] = await Promise.all([
		downloadDemoHtmlPart(prospectId, 1),
		downloadDemoHtmlPart(prospectId, 2),
		downloadDemoHtmlPart(prospectId, 3)
	]);
	if (p1?.trim() && p2?.trim() && p3?.trim()) {
		return p1.trim() + '\n' + p2.trim() + '\n' + p3.trim();
	}

	// Fall back to text/markdown and convert to HTML when pulled
	const contentPath = getDemoContentStoragePath(prospectId);
	const { data: contentData, error: contentError } = await supabase.storage.from(BUCKET).download(contentPath);
	if (contentError || !contentData) {
		if (contentError) {
			const msg = (contentError as { message?: string }).message;
			const errMsg =
				(msg && msg !== '{}' ? msg : null) ??
				(contentError as { error?: string }).error ??
				(contentError as { name?: string }).name ??
				(JSON.stringify(contentError) !== '{}' ? JSON.stringify(contentError) : 'File not found or storage error');
			serverError('demoStorage', 'content download failed', { prospectId, error: errMsg });
		}
		return null;
	}

	const text = await contentData.text();
	const bodyHtml = marked.parse(text, { async: false }) as string;
	const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Demo</title></head><body>${bodyHtml}</body></html>`;
	return html;
}
