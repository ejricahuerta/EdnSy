/**
 * Integration help docs (Markdown) bundled at build time so they work in production.
 * Used by dashboard integrations page and help/[id] route.
 */

import notionRaw from '../../../docs/integrations/notion.md?raw';
import gbpDentalRaw from '../../../docs/integrations/gbp-dental.md?raw';

export const INTEGRATION_HELP_DOCS: Record<string, string> = {
	notion: notionRaw,
	'gbp-dental': gbpDentalRaw
};

export const INTEGRATION_IDS = ['notion', 'gbp-dental'] as const;
