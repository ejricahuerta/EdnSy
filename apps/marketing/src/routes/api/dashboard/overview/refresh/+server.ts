import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';
import { listProspects } from '$lib/server/prospects';
import { getDemoTrackingForUser, getDashboardOverview, upsertDashboardOverview } from '$lib/server/supabase';
import { buildCrmContext } from '$lib/server/crmContext';
import { OVERVIEW_REFRESH_COOLDOWN_MINUTES } from '$lib/constants';

const GEMINI_API_KEY = env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';

const OVERVIEW_PROMPT = `Based on the CRM data below, produce a short dashboard overview. Return ONLY a single JSON object (no markdown, no code fence) with exactly these keys:
- "what": 1-2 sentences summarizing what the user has (e.g. client count, demos sent, opens/clicks/replies).
- "keyFindings": 1-2 sentences with key metrics (sent, opened, clicked, replied, approved, drafts, no-demo-but-email).
- "next": 1-2 sentences on recommended next actions (send approved, create demos, review drafts, follow up with engaged).
- "stagnation": 1-2 sentences on where the pipeline might be stuck or what to watch (e.g. demos ready but not sent, no opens yet, drafts piling up).

Keep each value concise and actionable for a dashboard.`;

type OverviewJson = {
	what?: string;
	keyFindings?: string;
	next?: string;
	stagnation?: string;
};

function parseOverviewFromText(text: string): OverviewJson | null {
	const trimmed = text.trim().replace(/^```\w*\n?|\n?```$/g, '').trim();
	try {
		const parsed = JSON.parse(trimmed) as OverviewJson;
		if (
			typeof parsed.what === 'string' &&
			typeof parsed.keyFindings === 'string' &&
			typeof parsed.next === 'string' &&
			typeof parsed.stagnation === 'string'
		) {
			return parsed;
		}
	} catch {
		// try to find JSON block
		const match = trimmed.match(/\{[\s\S]*\}/);
		if (match) {
			try {
				const parsed = JSON.parse(match[0]) as OverviewJson;
				if (
					typeof parsed.what === 'string' &&
					typeof parsed.keyFindings === 'string' &&
					typeof parsed.next === 'string' &&
					typeof parsed.stagnation === 'string'
				) {
					return parsed;
				}
			} catch {
				// ignore
			}
		}
	}
	return null;
}

export const POST: RequestHandler = async ({ cookies }) => {
	const cookie = cookies.get(getSessionCookieName());
	const user = await getSessionFromCookie(cookie);
	if (!user) {
		return json({ error: 'Sign in required' }, { status: 401 });
	}

	if (!GEMINI_API_KEY) {
		return json(
			{ error: 'AI overview is not configured', code: 'MISSING_API_KEY' },
			{ status: 503 }
		);
	}

	const existing = await getDashboardOverview(user.id);
	const now = Date.now();
	const cooldownMs = OVERVIEW_REFRESH_COOLDOWN_MINUTES * 60 * 1000;
	if (existing?.generated_at) {
		const generatedAt = new Date(existing.generated_at).getTime();
		if (now - generatedAt < cooldownMs) {
			const nextAllowedAt = generatedAt + cooldownMs;
			return json(
				{
					error: 'Please wait before regenerating the overview.',
					code: 'COOLDOWN',
					nextAllowedAt: new Date(nextAllowedAt).toISOString(),
					cooldownMinutes: OVERVIEW_REFRESH_COOLDOWN_MINUTES
				},
				{ status: 429 }
			);
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
		console.error('Gemini overview refresh error:', res.status, err);
		if (res.status === 429) {
			return json(
				{ error: 'AI is busy. Please try again in a moment.', code: 'RATE_LIMIT' },
				{ status: 503 }
			);
		}
		return json(
			{ error: 'Overview generation failed. Please try again.', code: 'GENERATION_FAILED' },
			{ status: 502 }
		);
	}

	const data = (await res.json()) as {
		candidates?: { content?: { parts?: { text?: string }[] } }[];
	};
	const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
	const parsed = parseOverviewFromText(rawText);
	if (!parsed) {
		console.error('Overview refresh: invalid JSON from model', rawText.slice(0, 200));
		return json(
			{ error: 'Overview generation returned invalid format. Please try again.', code: 'INVALID_RESPONSE' },
			{ status: 502 }
		);
	}

	const upsertResult = await upsertDashboardOverview(user.id, {
		what: parsed.what ?? '',
		keyFindings: parsed.keyFindings ?? '',
		next: parsed.next ?? '',
		stagnation: parsed.stagnation ?? ''
	});

	if (!upsertResult.ok) {
		return json(
			{ error: upsertResult.error ?? 'Failed to save overview', code: 'SAVE_FAILED' },
			{ status: 502 }
		);
	}

	const generatedAt = new Date().toISOString();
	return json({
		what: parsed.what,
		keyFindings: parsed.keyFindings,
		next: parsed.next,
		stagnation: parsed.stagnation,
		generatedAt
	});
};
