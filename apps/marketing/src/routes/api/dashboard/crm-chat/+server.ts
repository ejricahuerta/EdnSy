import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';
import { listProspects } from '$lib/server/prospects';
import { getDemoTrackingForUser } from '$lib/server/supabase';
import { buildCrmContext } from '$lib/server/crmContext';
import { CHAT_DAILY_LIMIT } from '$lib/constants';

const GEMINI_API_KEY = env.GEMINI_API_KEY;
const COOKIE_DATE = 'crm_chat_daily_date';
const COOKIE_COUNT = 'crm_chat_daily_count';
const GEMINI_MODEL = 'gemini-2.5-flash';

function getToday(): string {
	return new Date().toISOString().slice(0, 10);
}

function getCountAndDate(cookies: { get: (n: string) => string | undefined }): {
	count: number;
	date: string;
} {
	const date = cookies.get(COOKIE_DATE) ?? '';
	const count = parseInt(cookies.get(COOKIE_COUNT) ?? '0', 10);
	const today = getToday();
	if (date !== today) return { count: 0, date: today };
	return { count: isNaN(count) ? 0 : count, date: today };
}

function toGeminiContents(
	messages: { role: string; content: string }[]
): { role: string; parts: { text: string }[] }[] {
	const out: { role: string; parts: { text: string }[] }[] = [];
	for (const m of messages) {
		if (m.role === 'system') continue;
		const role = m.role === 'assistant' ? 'model' : 'user';
		out.push({ role, parts: [{ text: m.content || '' }] });
	}
	return out;
}

export const POST: RequestHandler = async ({ request, cookies }) => {
	const cookie = cookies.get(getSessionCookieName());
	const user = await getSessionFromCookie(cookie);
	if (!user) {
		return json({ error: 'Sign in required' }, { status: 401 });
	}

	if (!GEMINI_API_KEY) {
		return json(
			{ error: 'AI insights are not configured', code: 'MISSING_API_KEY' },
			{ status: 503 }
		);
	}

	const { count, date } = getCountAndDate(cookies);
	if (count >= CHAT_DAILY_LIMIT) {
		return json(
			{
				locked: true,
				message: `You've reached the daily limit of ${CHAT_DAILY_LIMIT} messages for CRM chat. Try again tomorrow.`
			},
			{ status: 429 }
		);
	}

	let body: { messages?: { role: string; content: string }[] };
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const messages = body.messages;
	if (!Array.isArray(messages) || messages.length === 0) {
		return json({ error: 'messages array required' }, { status: 400 });
	}

	const result = await listProspects(user.id);
	const prospects = result.prospects;
	const demoTrackingByProspectId = await getDemoTrackingForUser(user.id);
	const systemInstruction = buildCrmContext(prospects, demoTrackingByProspectId);
	const geminiContents = toGeminiContents(messages);

	const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			systemInstruction: { parts: [{ text: systemInstruction }] },
			contents: geminiContents,
			generationConfig: { maxOutputTokens: 600 }
		})
	});

	if (!res.ok) {
		const err = await res.text();
		console.error('Gemini CRM chat error:', res.status, err);
		if (res.status === 429) {
			return json(
				{
					locked: true,
					message: 'AI is busy. Please try again in a moment.'
				},
				{ status: 503 }
			);
		}
		return json({ error: 'AI insights are temporarily unavailable' }, { status: 502 });
	}

	const data = (await res.json()) as {
		candidates?: { content?: { parts?: { text?: string }[] } }[];
	};
	const parts = data.candidates?.[0]?.content?.parts;
	const content = parts?.[0]?.text?.trim() ?? 'Sorry, I could not generate a response.';

	const newCount = count + 1;
	cookies.set(COOKIE_DATE, date, { path: '/', maxAge: 60 * 60 * 24 * 2, sameSite: 'lax' });
	cookies.set(COOKIE_COUNT, String(newCount), { path: '/', maxAge: 60 * 60 * 24 * 2, sameSite: 'lax' });

	return json({ content });
};
