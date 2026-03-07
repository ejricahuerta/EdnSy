import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';
import { apiError, apiSuccess } from '$lib/server/apiResponse';
import { listProspects } from '$lib/server/prospects';
import { getDemoTrackingForUser, getDashboardOverview, upsertDashboardOverview } from '$lib/server/supabase';
import { buildCrmContext } from '$lib/server/crmContext';
import { OVERVIEW_REFRESH_COOLDOWN_MINUTES } from '$lib/constants';
import { serverError } from '$lib/server/logger';

const GEMINI_API_KEY = env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';

const OVERVIEW_PROMPT = `Based on the CRM data below, produce a short dashboard overview. Return ONLY a single JSON object (no markdown, no code fence) with exactly these keys, all string values:
- "what": 1-2 sentences summarizing what the user has (e.g. client count, demos sent, opens/clicks/replies).
- "keyFindings": 1-2 sentences with key metrics (sent, opened, clicked, replied, approved, drafts, no-demo-but-email).
- "next": 1-2 sentences on recommended next actions (send approved, create demos, review drafts, follow up with engaged).
- "stagnation": 1-2 sentences on where the pipeline might be stuck or what to watch (e.g. demos ready but not sent, no opens yet, drafts piling up).

Example format: {"what":"...","keyFindings":"...","next":"...","stagnation":"..."}
Keep each value concise and actionable for a dashboard.`;

type OverviewJson = {
	what: string;
	keyFindings: string;
	next: string;
	stagnation: string;
};

const OVERVIEW_KEYS = ['what', 'keyFindings', 'next', 'stagnation'] as const;
const KEY_ALIASES: Record<string, (typeof OVERVIEW_KEYS)[number]> = {
	what: 'what',
	keyfindings: 'keyFindings',
	'key_findings': 'keyFindings',
	next: 'next',
	stagnation: 'stagnation'
};

function toStr(v: unknown): string {
	if (v == null) return '';
	if (typeof v === 'string') return v;
	if (Array.isArray(v)) return v.map(toStr).filter(Boolean).join(' ');
	return String(v);
}

function parseOverviewFromText(text: string): OverviewJson | null {
	const trimmed = text.trim().replace(/^```\w*\n?|\n?```$/g, '').trim();
	const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
	const toParse = jsonMatch ? jsonMatch[0] : trimmed;
	const normalized = toParse.replace(/,(\s*[}\]])/g, '$1');
	let parsed: Record<string, unknown>;
	try {
		parsed = JSON.parse(normalized) as Record<string, unknown>;
	} catch {
		return null;
	}
	const result: Record<string, string> = {};
	for (const key of OVERVIEW_KEYS) {
		const aliasKeys = Object.entries(KEY_ALIASES).filter(([, v]) => v === key).map(([k]) => k);
		let value: unknown;
		for (const k of [key, ...aliasKeys]) {
			if (Object.prototype.hasOwnProperty.call(parsed, k)) {
				value = parsed[k];
				break;
			}
		}
		result[key] = toStr(value ?? '');
	}
	const hasContent = OVERVIEW_KEYS.some((k) => (result[k] ?? '').trim().length > 0);
	return hasContent ? (result as OverviewJson) : null;
}

/**
 * POST /api/dashboard/overview — (re)generate dashboard overview. Resource-oriented; replaces legacy /overview/refresh.
 */
export const POST: RequestHandler = async ({ cookies }) => {
	const cookie = cookies.get(getSessionCookieName());
	const user = await getSessionFromCookie(cookie);
	if (!user) {
		return apiError(401, 'Sign in required');
	}

	if (!GEMINI_API_KEY) {
		return apiError(503, 'AI overview is not configured', 'MISSING_API_KEY');
	}

	const existing = await getDashboardOverview(user.id);
	const now = Date.now();
	const cooldownMs = OVERVIEW_REFRESH_COOLDOWN_MINUTES * 60 * 1000;
	if (existing?.generated_at) {
		const generatedAt = new Date(existing.generated_at).getTime();
		if (now - generatedAt < cooldownMs) {
			return apiError(429, 'Please wait before regenerating the overview.', 'COOLDOWN');
		}
	}

	const result = await listProspects(user.id);
	const prospects = result.prospects;
	const demoTrackingByProspectId = await getDemoTrackingForUser(user.id);
	const systemContext = buildCrmContext(prospects, demoTrackingByProspectId);
	const userPrompt = `${OVERVIEW_PROMPT}\n\n--- CRM DATA ---\n${systemContext}`;

	const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
			generationConfig: { maxOutputTokens: 800, responseMimeType: 'application/json' }
		})
	});

	if (!res.ok) {
		const err = await res.text();
		serverError('api/dashboard/overview', 'Gemini error', { status: res.status, body: err });
		if (res.status === 429) {
			return apiError(503, 'AI is busy. Please try again in a moment.', 'RATE_LIMIT');
		}
		return apiError(502, 'Overview generation failed. Please try again.', 'GENERATION_FAILED');
	}

	const data = (await res.json()) as {
		candidates?: { content?: { parts?: { text?: string }[] } }[];
	};
	const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
	if (!rawText) {
		serverError('api/dashboard/overview', 'empty response from model', { data: JSON.stringify(data).slice(0, 300) });
		return apiError(502, 'Overview generation returned invalid format. Please try again.', 'INVALID_RESPONSE');
	}
	const parsed = parseOverviewFromText(rawText);
	if (!parsed) {
		serverError('api/dashboard/overview', 'could not parse overview JSON', { raw: rawText.slice(0, 300) });
		return apiError(502, 'Overview generation returned invalid format. Please try again.', 'INVALID_RESPONSE');
	}

	const upsertResult = await upsertDashboardOverview(user.id, {
		what: parsed.what ?? '',
		keyFindings: parsed.keyFindings ?? '',
		next: parsed.next ?? '',
		stagnation: parsed.stagnation ?? ''
	});

	if (!upsertResult.ok) {
		return apiError(502, upsertResult.error ?? 'Failed to save overview', 'SAVE_FAILED');
	}

	const generatedAt = new Date().toISOString();
	return apiSuccess({
		overview: {
			what: parsed.what,
			keyFindings: parsed.keyFindings,
			next: parsed.next,
			stagnation: parsed.stagnation
		},
		generatedAt
	});
};
