/**
 * Cal.com booking link (same as main landing app).
 * Use for all CTA buttons on demo landing templates.
 */
export const CAL_COM_LINK = 'https://cal.com/edmel-ednsy/enable-ai';

/**
 * Google Maps embed URL centered on Yonge and Finch, North York, Toronto (43.7756, -79.4124).
 * All demo landings use this map only; displayed addresses use mockup "1 Yonge Finch Plaza, Toronto, ON".
 */
export const YONGE_FINCH_MAP_EMBED_URL =
	'https://www.google.com/maps?q=43.7756,-79.4124&z=16&output=embed';

/** Max AI chat messages per browser per day; when exceeded, show Cal.com CTA. */
export const CHAT_DAILY_LIMIT = 10;

/** Minutes before dashboard overview can be regenerated (rate limit). */
export const OVERVIEW_REFRESH_COOLDOWN_MINUTES = 15;

/** Demo phone number for all industry landings (tel: link and display). */
export const DEMO_PHONE = '+12895135055';
export const DEMO_PHONE_DISPLAY = '+1 (289) 513-5055';

/** Legal: company name and physical address for email footers (AUP/CASL). Update with full address. */
export const LEGAL_COMPANY_NAME = 'Ed & Sy Inc.';
export const LEGAL_COMPANY_ADDRESS = 'Ontario, Canada';
