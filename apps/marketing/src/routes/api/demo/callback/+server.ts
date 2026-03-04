import { env as envPrivate } from '$env/dynamic/private';
import { env as envPublic } from '$env/dynamic/public';
import { apiError, apiSuccess } from '$lib/server/apiResponse';
import type { RequestHandler } from './$types';

const RETELL_API_URL = 'https://api.retellai.com/v2/create-phone-call';

/**
 * Normalize to E.164: digits only, then add + and country code if 10 digits (US/CA).
 * Does not validate internationally; Retell will validate.
 */
function normalizePhone(input: string): string | null {
	const digits = input.replace(/\D/g, '');
	if (digits.length === 10) return `+1${digits}`;
	if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
	if (digits.length >= 11) return `+${digits}`;
	return null;
}

export const POST: RequestHandler = async ({ request }) => {
	const apiKey = envPrivate.RETELL_API_KEY;
	const fromNumber =
		envPrivate.RETELL_PHONE_NUMBER ?? (envPublic as Record<string, string | undefined>).PUBLIC_RETELL_PHONE_NUMBER;
	const agentId =
		envPrivate.RETELL_AGENT_ID ?? (envPublic as Record<string, string | undefined>).PUBLIC_RETELL_AGENT_ID;

	if (!apiKey || !fromNumber) {
		const missing = [!apiKey && 'RETELL_API_KEY', !fromNumber && '(RETELL_PHONE_NUMBER or PUBLIC_RETELL_PHONE_NUMBER)']
			.filter(Boolean)
			.join(', ');
		return apiError(
			503,
			`Callback is not configured. Add ${missing} to .env (RETELL_API_KEY from Retell Dashboard → API keys).`,
			'NOT_CONFIGURED'
		);
	}

	let body: { firstName?: string; lastName?: string; phone?: string; agreeToTerms?: boolean };
	try {
		body = (await request.json()) as typeof body;
	} catch {
		return apiError(400, 'Invalid JSON');
	}

	const { firstName, lastName, phone: rawPhone, agreeToTerms } = body;
	if (!firstName?.trim() || !rawPhone?.trim()) {
		return apiError(400, 'First name and phone number are required');
	}
	if (!agreeToTerms) {
		return apiError(400, 'Please agree to the terms and conditions');
	}

	const toNumber = normalizePhone(rawPhone.trim());
	if (!toNumber) {
		return apiError(400, 'Please enter a valid phone number');
	}

	const customerName = [firstName.trim(), lastName?.trim()].filter(Boolean).join(' ') || firstName.trim();

	const payload: {
		from_number: string;
		to_number: string;
		override_agent_id?: string;
		retell_llm_dynamic_variables?: Record<string, string>;
	} = {
		from_number: fromNumber.trim(),
		to_number: toNumber,
		retell_llm_dynamic_variables: { customer_name: customerName }
	};
	if (agentId) payload.override_agent_id = agentId.trim();

	const res = await fetch(RETELL_API_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify(payload)
	});

	const data = await res.json().catch(() => ({}));

	if (!res.ok) {
		const message =
			(data?.message as string) ||
			(data?.detail as string) ||
			(data?.error as string) ||
			'Could not start callback';
		const status = res.status >= 500 ? 502 : res.status;
		return apiError(status, message, (data?.code as string) ?? 'RETELL_ERROR');
	}

	return apiSuccess({ ok: true, message: 'We’ll call you shortly.' });
};
