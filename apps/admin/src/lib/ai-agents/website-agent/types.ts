/**
 * Output shape from the website analysis agent.
 * Grades for UI, UX, funnel, SEO; overall grade; optional funnel summary; demo JSON for create-demo step.
 */

import type { LandingPageIndexJson } from '$lib/types/landingPageIndexJson';

export type WebsiteAgentOutput = {
	uiGrade: string;
	uxGrade: string;
	funnelGrade: string;
	seoGrade: string;
	overallGrade: string;
	funnelSummary?: string | null;
	demoJson: LandingPageIndexJson | null;
};
