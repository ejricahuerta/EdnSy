/**
 * Ed & Sy Admin — values aligned with apps/admin/src/globals.css and apps/landing/src/app.css.
 * Legacy names (--sage, etc.) in app.css still point at these concepts (primary purple).
 */
export const styleGuideTokens = {
	primary: '#3a00ff',
	primaryLight: '#6b4dff',
	primaryLighter: '#8f66ff',
	background: '#ffffff',
	foreground: '#0a0a0a',
	ink: '#0a0a0a',
	/** Legacy alias: primary */
	sage: '#3a00ff',
	sageLight: '#6b4dff',
	amber: '#3a00ff',
	amberLight: '#8f66ff',
	cream: '#ffffff',
	muted: '#737373',
	border: '#e5e5e5',
	surface: '#f7f7f7',
	white: '#ffffff',
	error: '#dc2626',
	success: '#15803d',
} as const;

/** Matches --chart-1 … --chart-5 in globals.css (light theme) */
export const chartColors = [
	'oklch(0.646 0.222 41.116)',
	'oklch(0.6 0.118 184.704)',
	'oklch(0.398 0.07 227.392)',
	'oklch(0.828 0.189 84.429)',
	'oklch(0.769 0.188 70.08)',
] as const;

export type StyleGuideToken = keyof typeof styleGuideTokens;
