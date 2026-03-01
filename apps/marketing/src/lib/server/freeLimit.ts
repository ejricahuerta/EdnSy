import { FREE_BRIEFINGS_PER_MONTH } from '$lib/plans';

const COOKIE_NAME = 'lr_free_briefings';
const COOKIE_MAX_AGE_DAYS = 31;

/** Format YYYY-MM for current month (used to reset count each month). */
function currentMonthKey(): string {
	const d = new Date();
	return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export type FreeLimitState = {
	count: number;
	limit: number;
	monthKey: string;
	remaining: number;
	atLimit: boolean;
};

/**
 * Read free briefings count from cookie. Cookie value: "monthKey:count" (e.g. "2026-02:3").
 * Resets if month has changed.
 */
export function getFreeBriefingsState(cookies: { get: (name: string) => string | undefined }): FreeLimitState {
	const raw = cookies.get(COOKIE_NAME);
	const monthKey = currentMonthKey();
	const limit = FREE_BRIEFINGS_PER_MONTH;

	if (!raw || !raw.includes(':')) {
		return { count: 0, limit, monthKey, remaining: limit, atLimit: false };
	}

	const [storedMonth, countStr] = raw.split(':');
	const count = Math.min(Math.max(0, parseInt(countStr, 10) || 0), limit);

	if (storedMonth !== monthKey) {
		return { count: 0, limit, monthKey, remaining: limit, atLimit: false };
	}

	return {
		count,
		limit,
		monthKey,
		remaining: Math.max(0, limit - count),
		atLimit: count >= limit
	};
}

/** Cookies interface for server (get + set). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServerCookies = { get: (name: string) => string | undefined; set: (name: string, value: string, opts?: any) => void };

/**
 * Increment free briefings count and persist via cookies.set.
 */
export function incrementFreeBriefings(cookies: ServerCookies): FreeLimitState {
	const state = getFreeBriefingsState(cookies);
	const newCount = Math.min(state.count + 1, state.limit);
	const value = `${state.monthKey}:${newCount}`;
	cookies.set(COOKIE_NAME, value, {
		path: '/',
		maxAge: COOKIE_MAX_AGE_DAYS * 24 * 60 * 60,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production'
	});
	return {
		...state,
		count: newCount,
		remaining: Math.max(0, state.limit - newCount),
		atLimit: newCount >= state.limit
	};
}
