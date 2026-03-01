/**
 * GoHighLevel CRM: fetch contacts using API token (Bearer).
 */

export type GHLContact = {
	id: string;
	companyName: string;
	email: string;
	website: string;
	phone: string;
	industry?: string;
};

export async function listGoHighLevelContacts(accessToken: string): Promise<{ contacts: GHLContact[]; error?: string }> {
	try {
		const res = await fetch('https://rest.gohighlevel.com/v1/contacts/', {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json'
			}
		});
		if (!res.ok) {
			const body = (await res.json().catch(() => ({}))) as { message?: string };
			return { contacts: [], error: body.message ?? `GoHighLevel API ${res.status}` };
		}
		const data = (await res.json()) as { contacts?: Array<Record<string, unknown>> };
		const list = data.contacts ?? [];
		const contacts: GHLContact[] = [];
		for (const c of list) {
			const companyName = ((c.companyName ?? c.company ?? c.name ?? '') as string).toString().trim() || 'Unknown';
			const email = ((c.email ?? (c.emails as string[])?.[0]) as string)?.toString?.()?.trim() ?? '';
			const phone = ((c.phone ?? c.phoneNumber ?? (c.phones as string[])?.[0]) as string)?.toString?.()?.trim() ?? '';
			const website = ((c.website ?? c.websiteUrl) as string)?.toString?.()?.trim() ?? '';
			if (companyName || email || phone) {
				const id = (c.id ?? c.contactId ?? '') as string;
				if (!id) continue;
				contacts.push({
					id: String(id),
					companyName,
					email,
					website,
					phone,
					industry: ((c.industry ?? (c.tags as string[])?.[0]) as string)?.toString?.()?.trim() || undefined
				});
			}
		}
		return { contacts };
	} catch (e) {
		return { contacts: [], error: e instanceof Error ? e.message : 'GoHighLevel request failed' };
	}
}
