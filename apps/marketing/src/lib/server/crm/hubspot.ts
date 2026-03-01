/**
 * HubSpot CRM: fetch contacts using Private App token (Bearer).
 */

export type HubSpotContact = {
	id: string;
	companyName: string;
	email: string;
	website: string;
	phone: string;
	industry?: string;
};

export async function listHubSpotContacts(accessToken: string): Promise<{ contacts: HubSpotContact[]; error?: string }> {
	const props = 'firstname,lastname,email,company,website,phone,industry';
	try {
		const all: HubSpotContact[] = [];
		let after: string | undefined;
		do {
			const url = new URL('https://api.hubapi.com/crm/v3/objects/contacts');
			url.searchParams.set('limit', '100');
			url.searchParams.set('properties', props);
			if (after) url.searchParams.set('after', after);

			const res = await fetch(url.toString(), {
				headers: { Authorization: 'Bearer ' + accessToken }
			});
			if (!res.ok) {
				const body = (await res.json().catch(() => ({}))) as { message?: string };
				return { contacts: [], error: body.message ?? 'HubSpot API ' + res.status };
			}
			const data = (await res.json()) as {
				results?: Array<{ id: string; properties: Record<string, string> }>;
				paging?: { next?: { after?: string } };
			};
			const results = data.results ?? [];
			for (const c of results) {
				const p = c.properties ?? {};
				const first = (p.firstname ?? '').trim();
				const last = (p.lastname ?? '').trim();
				const companyName = (p.company ?? '').trim() || [first, last].filter(Boolean).join(' ') || 'Unknown';
				const email = (p.email ?? '').trim();
				const website = (p.website ?? '').trim();
				const phone = (p.phone ?? '').trim();
				if (companyName || email || phone) {
					all.push({
						id: c.id,
						companyName,
						email,
						website,
						phone,
						industry: (p.industry ?? '').trim() || undefined
					});
				}
			}
			after = data.paging?.next?.after;
		} while (after);
		return { contacts: all };
	} catch (e) {
		return { contacts: [], error: e instanceof Error ? e.message : 'HubSpot request failed' };
	}
}
