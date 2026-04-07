import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { getPageContextForIndustry, DEFAULT_CHAT_SYSTEM_INSTRUCTION } from '$lib/server/chatContext';
import { getResolvedContent } from '$lib/server/agentContent';
import { apiError, apiSuccess } from '$lib/server/apiResponse';
import { CHAT_DAILY_LIMIT } from '$lib/constants';
import { serverError } from '$lib/server/logger';
import type { IndustrySlug } from '$lib/industries';

const GEMINI_API_KEY = env.GEMINI_API_KEY;

const COOKIE_DATE = 'chat_daily_date';
const COOKIE_COUNT = 'chat_daily_count';

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

/** Map chat role to Gemini role (user | model). Skip system. */
function toGeminiContents(messages: { role: string; content: string }[]): { role: string; parts: { text: string }[] }[] {
	const out: { role: string; parts: { text: string }[] }[] = [];
	for (const m of messages) {
		if (m.role === 'system') continue;
		const role = m.role === 'assistant' ? 'model' : 'user';
		out.push({ role, parts: [{ text: m.content || '' }] });
	}
	return out;
}

export const POST: RequestHandler = async (event) => {
	const { request, cookies } = event;
	if (!GEMINI_API_KEY) {
		return apiError(503, 'Chat is not configured', 'MISSING_API_KEY');
	}

	const { count, date } = getCountAndDate(cookies);
	if (count >= CHAT_DAILY_LIMIT) {
		return apiError(
			429,
			`You've reached the daily limit of ${CHAT_DAILY_LIMIT} messages. Book a call to continue the conversation.`,
			'RATE_LIMIT'
		);
	}

	let body: { messages?: { role: string; content: string }[]; industrySlug?: string; displayName?: string };
	try {
		body = await request.json();
	} catch {
		return apiError(400, 'Invalid JSON body');
	}

	const { messages, industrySlug, displayName } = body;
	if (!Array.isArray(messages) || messages.length === 0) {
		return apiError(400, 'messages array required');
	}

	const slug = (industrySlug ?? 'other') as IndustrySlug;
	const resolved = await getResolvedContent(
		'demo-chat',
		'prompt',
		'system_instruction',
		DEFAULT_CHAT_SYSTEM_INSTRUCTION
	);
	const pageContext = getPageContextForIndustry(slug, displayName, resolved.body);

	const systemMessage = { role: 'system', content: pageContext };
	const geminiContents = toGeminiContents([systemMessage, ...messages]);

	const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			systemInstruction: { parts: [{ text: pageContext }] },
			contents: geminiContents,
			generationConfig: { maxOutputTokens: 400 }
		})
	});

	if (!res.ok) {
		const err = await res.text();
		serverError('api/chat', 'Gemini error', { status: res.status, body: err });
		if (res.status === 429) {
			return apiError(
				503,
				'Chat is busy right now. Please try again in a moment or book a call with us below.',
				'RATE_LIMIT'
			);
		}
		return apiError(502, 'Assistant is temporarily unavailable');
	}

	const data = (await res.json()) as {
		candidates?: { content?: { parts?: { text?: string }[] } }[];
	};
	const parts = data.candidates?.[0]?.content?.parts;
	const content = parts?.[0]?.text?.trim() ?? 'Sorry, I could not generate a response.';

	const newCount = count + 1;
	cookies.set(COOKIE_DATE, date, { path: '/', maxAge: 60 * 60 * 24 * 2, sameSite: 'lax' });
	cookies.set(COOKIE_COUNT, String(newCount), { path: '/', maxAge: 60 * 60 * 24 * 2, sameSite: 'lax' });

	return apiSuccess({ content });
};
