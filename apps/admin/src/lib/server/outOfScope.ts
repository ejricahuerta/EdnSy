/**
 * Detect companies that are out of scope for the app (e.g. large enterprises).
 * Used when syncing from CRM: such rows are flagged so demos, GBP, and send are blocked.
 */

/** Known large-enterprise / big-corp names (case-insensitive match on company name). */
const OUT_OF_SCOPE_COMPANY_NAMES = new Set(
	[
		'Microsoft',
		'Google',
		'Apple',
		'Amazon',
		'Meta',
		'Facebook',
		'Alphabet',
		'Tesla',
		'Berkshire Hathaway',
		'Johnson & Johnson',
		'JPMorgan',
		'JPMorgan Chase',
		'ExxonMobil',
		'Exxon',
		'Mobil',
		'Bank of America',
		'Walmart',
		'Chevron',
		'Procter & Gamble',
		'P&G',
		'Verizon',
		'AT&T',
		'Kraft Heinz',
		'Costco',
		'Pfizer',
		'Home Depot',
		'Merck',
		'CVS Health',
		'AbbVie',
		'PepsiCo',
		'Citigroup',
		'Citi',
		'Comcast',
		'Wells Fargo',
		'Phillips 66',
		'Boeing',
		'Intel',
		'IBM',
		'Netflix',
		'Disney',
		'Walt Disney',
		'Target',
		'Nike',
		'Coca-Cola',
		'Starbucks',
		'McDonald\'s',
		'McDonalds',
		'Salesforce',
		'Oracle',
		'SAP',
		'Adobe',
		'Cisco',
		'Accenture',
		'Deloitte',
		'PwC',
		'EY',
		'KPMG',
		'Goldman Sachs',
		'Morgan Stanley',
		'BlackRock',
		'State Street',
		'American Express',
		'UnitedHealth',
		'Anthem',
		'Humana',
		'FedEx',
		'UPS',
		'General Motors',
		'GM',
		'Ford',
		'Toyota',
		'Honda',
		'BMW',
		'Mercedes',
		'Volkswagen',
		'VW',
		'Samsung',
		'Sony',
		'LG',
		'Panasonic',
		'GE',
		'General Electric',
		'Siemens',
		'Shell',
		'BP',
		'TotalEnergies',
		'Nestlé',
		'Nestle',
		'Unilever',
		'L\'Oréal',
		'Loreal',
		'Procter and Gamble'
	].map((s) => s.toLowerCase().trim())
);

const FLAGGED_REASON_DEFAULT = 'Out of scope (large enterprise)';

/**
 * Returns true if the company name matches a known out-of-scope (e.g. large enterprise) name.
 * Used during CRM sync to auto-flag such prospects.
 */
export function isOutOfScopeCompany(companyName: string | null | undefined): boolean {
	const name = (companyName ?? '').trim();
	if (!name) return false;
	const lower = name.toLowerCase();
	// Exact match
	if (OUT_OF_SCOPE_COMPANY_NAMES.has(lower)) return true;
	// Company name contains a known name as a whole word (e.g. "Microsoft Canada")
	const words = lower.split(/\s+/);
	for (const word of words) {
		const cleaned = word.replace(/[^a-z0-9&']/g, '');
		if (cleaned && OUT_OF_SCOPE_COMPANY_NAMES.has(cleaned)) return true;
	}
	return false;
}

export function getDefaultFlaggedReason(): string {
	return FLAGGED_REASON_DEFAULT;
}
