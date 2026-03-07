/**
 * Insights lib: types and helpers for Gemini-generated business insights (grade, summary, recommendations).
 * Use this for UI and shared code. For server-only generation, use $lib/server/insights.
 */

export type {
	GeminiInsight,
	WebsiteInsight,
	AuditModalCopy
} from '$lib/types/demo';

export { hasUsableInsight } from '$lib/types/demo';
