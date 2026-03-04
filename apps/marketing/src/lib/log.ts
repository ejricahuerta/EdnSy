/**
 * Client-side logging for the marketing app. Use for errors and warnings
 * so console output is consistent and traceable (context + message).
 */

const PREFIX = '[marketing]';

export function clientError(context: string, message: string, detail?: unknown): void {
	const label = `${PREFIX} [${context}]`;
	if (detail !== undefined) {
		console.error(label, message, detail);
	} else {
		console.error(label, message);
	}
}

export function clientWarn(context: string, message: string, detail?: unknown): void {
	const label = `${PREFIX} [${context}]`;
	if (detail !== undefined) {
		console.warn(label, message, detail);
	} else {
		console.warn(label, message);
	}
}

export function clientInfo(context: string, message: string, detail?: unknown): void {
	const label = `${PREFIX} [${context}]`;
	if (detail !== undefined) {
		console.info(label, message, detail);
	} else {
		console.info(label, message);
	}
}
