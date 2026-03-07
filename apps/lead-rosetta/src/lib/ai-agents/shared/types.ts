/**
 * Shared types for AI agents in apps/lead-rosetta.
 * Use AgentResult for consistent ok/error results across GBP and website agents.
 */

export type AgentResult<T> =
	| { ok: true; data: T }
	| { ok: false; error: string };
