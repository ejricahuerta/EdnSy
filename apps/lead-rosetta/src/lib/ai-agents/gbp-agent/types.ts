/**
 * Output shape from the GBP grading agent.
 * Used to merge into the audit (gbpCompletenessScore, gbpCompletenessLabel).
 */

export type GbpGradeOutput = {
	/** 0–100 completeness/quality score */
	score: number;
	/** Short label e.g. "Strong", "Needs work", "Good" */
	label: string;
	/** Optional short reasoning for the UI */
	reasoning?: string;
};
