/**
 * Demo lib: status, themes, tracking, and demo-related types for UI and shared code.
 * For server-only demo creation (job, pageJson, storage, content), use $lib/server/demo.
 */

export {
	DEMO_TRACKING_STATUSES,
	VALID_DEMO_TRACKING_STATUSES,
	DEMO_TRACKING_OPTIONS,
	STATUS_FILTER_OPTIONS,
	ENGAGED_STATUSES,
	isValidDemoTrackingStatus,
	getDemoTrackingLabel,
	getStatusFilterOptionsForPipelineTab,
	getValidStatusFilterValuesForPipelineTab
} from '$lib/constants/demoStatus';

export type {
	DemoTrackingStatus,
	DemoStatusFilterValue,
	StatusFilterGroup,
	StatusFilterOption,
	PipelineTabId,
	StatusOptionsByGroup
} from '$lib/constants/demoStatus';

export {
	V13_THEMES,
	THEME_LAYOUT,
	TONE_TO_V13_THEME,
	INDUSTRY_TO_V13_THEME,
	getV13ThemeForTone,
	getThemeForIndustry,
	getThemeForLayout,
	getLayoutForTheme
} from '$lib/demoThemes';

export type { V13Theme } from '$lib/demoThemes';

export type { DemoTrackEvent } from '$lib/demoTracking';
export { trackDemoEvent } from '$lib/demoTracking';

export { auditFromScrapedData, isDemoAuditShape } from '$lib/types/demo';
export type { DemoAudit, DemoLandingContent } from '$lib/types/demo';

export type { DemoPageJson } from '$lib/types/demoPageJson';
