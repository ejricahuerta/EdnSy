/**
 * Standard JSON response helpers for /api routes.
 * All error responses use shape { error: string, code?: string } with appropriate HTTP status.
 * Success responses use resource-shaped bodies (e.g. { overview }, { job }, { data }).
 */

import { json } from '@sveltejs/kit';
import type { ResponseHeaders } from '@sveltejs/kit';

export type ApiErrorPayload = { error: string; code?: string };

/**
 * Return a JSON error response with standard envelope.
 * Use status: 401 (auth), 400 (validation), 404 (not found), 429 (rate limit), 502/503 (server/config).
 */
export function apiError(
	status: number,
	message: string,
	code?: string,
	init?: { headers?: ResponseHeaders }
): ReturnType<typeof json> {
	return json({ error: message, ...(code ? { code } : {}) } as ApiErrorPayload, {
		status,
		...init
	});
}

/**
 * Return a JSON success response (200). Prefer resource-shaped body, e.g. apiSuccess(200, { overview: {...} }).
 */
export function apiSuccess<T>(data: T, init?: { headers?: ResponseHeaders }): ReturnType<typeof json> {
	return json(data, { status: 200, ...init });
}
