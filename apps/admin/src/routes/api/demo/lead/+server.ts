/**
 * POST /api/demo/lead — Public lead capture from Stitch-generated demo hero forms.
 * Accepts application/x-www-form-urlencoded or JSON.
 */

import { json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSupabaseAdmin } from '$lib/server/supabase';
import { getProspectById } from '$lib/server/prospects';
import { NO_FIT_GBP_REASON } from '$lib/server/qualify';

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 30;
const rateState = new Map<string, { count: number; windowStart: number }>();

function allowSubmission(ipKey: string): boolean {
	const now = Date.now();
	const row = rateState.get(ipKey);
	if (!row || now - row.windowStart > WINDOW_MS) {
		rateState.set(ipKey, { count: 1, windowStart: now });
		return true;
	}
	if (row.count >= MAX_PER_WINDOW) return false;
	row.count += 1;
	return true;
}

function simpleEmailOk(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function clientIp(request: Request): string {
	const xf = request.headers.get('x-forwarded-for');
	if (xf) return xf.split(',')[0]?.trim() || 'unknown';
	return 'unknown';
}

export const POST: RequestHandler = async ({ request }) => {
	const ip = clientIp(request);
	if (!allowSubmission(ip)) {
		return json({ error: 'Too many submissions. Try again later.' }, { status: 429 });
	}

	const contentType = request.headers.get('content-type') ?? '';
	let prospectId = '';
	let name = '';
	let email = '';
	let phone = '';
	let message = '';
	let wantsRedirect = false;

	if (contentType.includes('application/json')) {
		try {
			const body = (await request.json()) as Record<string, unknown>;
			prospectId = typeof body.prospectId === 'string' ? body.prospectId.trim() : '';
			name = typeof body.name === 'string' ? body.name.trim() : '';
			email = typeof body.email === 'string' ? body.email.trim() : '';
			phone = typeof body.phone === 'string' ? body.phone.trim() : '';
			message = typeof body.message === 'string' ? body.message.trim() : '';
		} catch {
			return json({ error: 'Invalid JSON' }, { status: 400 });
		}
	} else {
		let fd: FormData;
		try {
			fd = await request.formData();
		} catch {
			return json({ error: 'Invalid form body' }, { status: 400 });
		}
		prospectId = String(fd.get('prospectId') ?? '').trim();
		name = String(fd.get('name') ?? '').trim();
		email = String(fd.get('email') ?? '').trim();
		phone = String(fd.get('phone') ?? '').trim();
		message = String(fd.get('message') ?? '').trim();
		wantsRedirect = true;
	}

	if (!prospectId || !name || !email) {
		return json({ error: 'prospectId, name, and email are required' }, { status: 400 });
	}
	if (!simpleEmailOk(email)) {
		return json({ error: 'Invalid email' }, { status: 400 });
	}
	if (name.length > 200 || email.length > 320 || phone.length > 50 || message.length > 5000) {
		return json({ error: 'Field too long' }, { status: 400 });
	}

	const prospect = await getProspectById(prospectId);
	if (!prospect) {
		return json({ error: 'Not found' }, { status: 404 });
	}
	if (prospect.flagged && prospect.flaggedReason !== NO_FIT_GBP_REASON) {
		return json({ error: 'Not found' }, { status: 404 });
	}

	const supabase = getSupabaseAdmin();
	if (!supabase) {
		return json({ error: 'Server misconfigured' }, { status: 503 });
	}

	const { error } = await supabase.from('demo_leads').insert({
		prospect_id: prospectId,
		name,
		email,
		...(phone ? { phone } : {}),
		...(message ? { message } : {}),
		ip_address: ip
	});

	if (error) {
		return json({ error: 'Could not save submission' }, { status: 500 });
	}

	if (wantsRedirect) {
		throw redirect(303, `/demo/${prospectId}?lead=submitted`);
	}
	return json({ ok: true });
};
