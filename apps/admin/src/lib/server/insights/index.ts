/**
 * Server-only insights: generate business insight (Gemini), audit modal copy, and industry inference.
 * Use for "Pull insights" and demo creation. Types and hasUsableInsight live in $lib/insights.
 */

export {
	generateInsightForProspect,
	generateInsightFromBusinessName,
	generateAuditModalCopy,
	inferIndustryWithGemini
} from '$lib/server/generateAudit';

export type {
	GenerateInsightResult,
	GenerateAuditModalCopyResult
} from '$lib/server/generateAudit';
