/**
 * Pipedrive CRM: fetch persons (contacts) using API token.
 * accessToken is stored as "companyDomain:apiToken" (e.g. "mycompany:abc123").
 */

export type PipedriveContact = {
	id: string;
	companyName: string;
	email: string;
	website: string;
	phone: string;
	industry?: string;
};

export async function listPipedriveContacts(
	accessToken: string
): Promise<{ contacts: PipedriveContact[]; error?: string }> {
	const colon = accessToken.indexOf(':');
	const domain = colon >= 0 ? accessToken.slice(0, colon).trim() : '';
	const token = colon >= 0 ? accessToken.slice(colon + 1).trim() : accessToken.trim();
	if (!domain || !token) {
		return { contacts: [], error: 'Pipedrive connection must be "domain:apiToken"' };
	}
	const baseUrl = `https://${domain}.pipedrive.com/api/v1`;
	const all: PipedriveContact[] = [];
	let start = 0;
	const limit = 100;
	try {
		do {
			const url = new URL(`${baseUrl}/persons`);
			url.searchParams.set('api_token', token);
			url.searchParams.set('start', String(start));
			url.searchParams.set('limit', String(limit));

			const res = await fetch(url.toString());
			if (!res.ok) {
				const body = (await res.json().catch(() => ({}))) as { error?: string };
				return { contacts: [], error: body.error ?? `Pipedrive API ${res.status}` };
			}
			const data = (await res.json()) as {
				data?: Array<{
					id: number;
					name?: string;
					email?: Array<{ value: string }>;
					phone?: Array<{ value: string }>;
					org_id?: number;
					[key: string]: unknown;
				}>;
				additional_data?: { pagination?: { next_start: number | null } };
			};
			const persons = data.data ?? [];
			for (const p of persons) {
				const email = Array.isArray(p.email) && p.email[0] ? String(p.email[0].value ?? '').trim() : '';
				const phone = Array.isArray(p.phone) && p.phone[0] ? String(p.phone[0].value ?? '').trim() : '';
				const name = (p.name ?? '').trim();
				const companyName = name || 'Unknown';
				if (companyName || email || phone) {
					all.push({
						id: String(p.id),
						companyName,
						email,
						website: '',
						phone,
						industry: undefined
					});
				}
			}
			const nextStart = data.additional_data?.pagination?.next_start;
			start = nextStart != null ? nextStart : -1;
		} while (start >= 0);
		return { contacts: all };
	} catch (e) {
		return { contacts: [], error: e instanceof Error ? e.message : 'Pipedrive request failed' };
	}
}
