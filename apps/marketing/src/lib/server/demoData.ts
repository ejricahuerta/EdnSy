import {
	getBusinessDataFromNotion,
	getWebsiteDataFromNotion,
	setBusinessDataInNotion,
	setWebsiteDataInNotion
} from '$lib/server/notion';
import type { BusinessData, WebsiteData } from '$lib/types/demo';

/**
 * Load Business Data for a prospect from Notion ("Business Data" property).
 */
export async function getBusinessData(prospectId: string): Promise<BusinessData | null> {
	return getBusinessDataFromNotion(prospectId);
}

/**
 * Save Business Data for a prospect to Notion ("Business Data" property).
 */
export async function setBusinessData(prospectId: string, data: BusinessData): Promise<void> {
	const result = await setBusinessDataInNotion(prospectId, data);
	if (!result.ok) {
		throw new Error(result.error ?? 'Failed to save Business Data to Notion');
	}
}

/**
 * Load Website Data for a prospect from Notion ("Website Data" property).
 */
export async function getWebsiteData(prospectId: string): Promise<WebsiteData | null> {
	return getWebsiteDataFromNotion(prospectId);
}

/**
 * Save Website Data for a prospect to Notion ("Website Data" property).
 */
export async function setWebsiteData(prospectId: string, data: WebsiteData): Promise<void> {
	const result = await setWebsiteDataInNotion(prospectId, data);
	if (!result.ok) {
		throw new Error(result.error ?? 'Failed to save Website Data to Notion');
	}
}
