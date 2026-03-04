/**
 * Server-side logging for the marketing app. Use for errors, warnings, and optional info
 * so logs are consistent and traceable (context + message + optional detail).
 */

const PREFIX = '[marketing]';

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
