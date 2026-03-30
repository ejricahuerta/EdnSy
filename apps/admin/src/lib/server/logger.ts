/**
 * Server-side logging for the admin app. Use for errors, warnings, and optional info
 * so logs are consistent and traceable (context + message + optional detail).
 * Set MARKETING_DEBUG=1 (or true/yes) in env to enable debug logs (serverDebug).
 */

import { env } from '$env/dynamic/private';

const PREFIX = '[admin]';

function isDebug(): boolean {
	const v = (env.MARKETING_DEBUG ?? env.DEBUG ?? '').toString().toLowerCase();
	return v === '1' || v === 'true' || v === 'yes';
}

export function serverError(context: string, message: string, detail?: unknown): void {
	const label = `${PREFIX} [${context}]`;
	if (detail !== undefined) {
		console.error(label, message, detail);
	} else {
		console.error(label, message);
	}
}

export function serverWarn(context: string, message: string, detail?: unknown): void {
	const label = `${PREFIX} [${context}]`;
	if (detail !== undefined) {
		console.warn(label, message, detail);
	} else {
		console.warn(label, message);
	}
}

export function serverInfo(context: string, message: string, detail?: unknown): void {
	const label = `${PREFIX} [${context}]`;
	if (detail !== undefined) {
		console.info(label, message, detail);
	} else {
		console.info(label, message);
	}
}

/** Only logs when MARKETING_DEBUG or DEBUG is set (1, true, yes). Use for verbose/debug output. */
export function serverDebug(context: string, message: string, detail?: unknown): void {
	if (!isDebug()) return;
	const label = `${PREFIX} [${context}]`;
	if (detail !== undefined) {
		console.info(label, message, detail);
	} else {
		console.info(label, message);
	}
}
