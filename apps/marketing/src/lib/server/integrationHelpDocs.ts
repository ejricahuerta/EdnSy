/**
 * Integration help docs (Markdown) bundled at build time so they work in production.
 * Used by dashboard integrations page and help/[id] route.
 */

import notionRaw from '../../../docs/integrations/notion.md?raw';
import hubspotRaw from '../../../docs/integrations/hubspot.md?raw';
import gohighlevelRaw from '../../../docs/integrations/gohighlevel.md?raw';
import pipedriveRaw from '../../../docs/integrations/pipedrive.md?raw';

export const INTEGRATION_HELP_DOCS: Record<string, string> = {
	notion: notionRaw,
	hubspot: hubspotRaw,
	gohighlevel: gohighlevelRaw,
	pipedrive: pipedriveRaw
};

export const INTEGRATION_IDS = ['notion', 'hubspot', 'gohighlevel', 'pipedrive'] as const;
