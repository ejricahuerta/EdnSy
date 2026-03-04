/**
 * Lead Rosetta design tokens – synced with docs/style-guides/style-guide.html
 * Use for JS/TS (e.g. charts, dynamic styles). CSS uses the same values via
 * app.css (.leadrosetta-app and .leadrosetta-app-dashboard).
 * Dashboard shadcn-svelte components read CSS variables; this file is for
 * when you need token values in JavaScript.
 */
export const styleGuideTokens = {
	cream: '#F5F0E8',
	ink: '#1A1A14',
	sage: '#3D5A3E',
	sageLight: '#5A7F5B',
	amber: '#C17D2A',
	amberLight: '#E09B3D',
	muted: '#7A7566',
	border: '#D8D0BF',
	surface: '#EEEAE0',
	white: '#FFFFFF',
	error: '#C04040',
	success: '#3D5A3E',
} as const;

/** Chart palette (matches --chart-1 … --chart-5 in app.css) */
export const chartColors = [
	styleGuideTokens.sage,
	styleGuideTokens.amber,
	styleGuideTokens.sageLight,
	styleGuideTokens.amberLight,
	styleGuideTokens.muted,
] as const;

export type StyleGuideToken = keyof typeof styleGuideTokens;
