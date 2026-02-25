import { env } from '$env/dynamic/private';
import * as nodeCrypto from 'node:crypto';

const COOKIE_NAME = 'marketing_session';
const MAX_AGE_DAYS = 7;

export interface SessionUser {
	id: string;
	email: string;
	name: string;
	picture: string;
}

function getSecret(): string | null {
	const s = env.SESSION_SECRET;
	if (!s || s.length < 16) return null;
	return s;
}

function base64UrlEncode(buf: Uint8Array): string {
	return Buffer.from(buf).toString('base64url');
}

function base64UrlDecode(str: string): Uint8Array {
	return new Uint8Array(Buffer.from(str, 'base64url'));
}

async function hmacSign(message: string, secret: string): Promise<Uint8Array> {
	const key = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const sig = await crypto.subtle.sign(
		'HMAC',
		key,
		new TextEncoder().encode(message)
	);
	return new Uint8Array(sig);
}

async function hmacVerify(message: string, signature: Uint8Array, secret: string): Promise<boolean> {
	const expected = await hmacSign(message, secret);
	if (expected.length !== signature.length) return false;
	return nodeCrypto.timingSafeEqual(expected, signature);
}

export function getSessionCookieName(): string {
	return COOKIE_NAME;
}

export function getSessionCookieOptions(): { path: string; maxAge: number; httpOnly: boolean; sameSite: 'lax' | 'strict'; secure?: boolean } {
	return {
		path: '/',
		maxAge: MAX_AGE_DAYS * 24 * 60 * 60,
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production'
	};
}

/**
 * Create a signed session cookie value for the given user.
 */
export async function createSessionCookie(user: SessionUser): Promise<string> {
	const secret = getSecret();
	if (!secret) throw new Error('SESSION_SECRET must be set and at least 16 characters');
	const payload = {
		...user,
		exp: Math.floor(Date.now() / 1000) + MAX_AGE_DAYS * 24 * 60 * 60
	};
	const payloadStr = JSON.stringify(payload);
	const payloadB64 = base64UrlEncode(new TextEncoder().encode(payloadStr));
	const sig = await hmacSign(payloadStr, secret);
	const sigB64 = base64UrlEncode(sig);
	return `${payloadB64}.${sigB64}`;
}

/**
 * Parse and verify the session cookie. Returns the user or null if invalid/expired.
 */
export async function getSessionFromCookie(cookieValue: string | undefined): Promise<SessionUser | null> {
	const secret = getSecret();
	if (!secret) return null;
	if (!cookieValue || !cookieValue.includes('.')) return null;
	const [payloadB64, sigB64] = cookieValue.split('.');
	if (!payloadB64 || !sigB64) return null;
	let payloadStr: string;
	try {
		payloadStr = new TextDecoder().decode(base64UrlDecode(payloadB64));
	} catch {
		return null;
	}
	const sig = base64UrlDecode(sigB64);
	const valid = await hmacVerify(payloadStr, sig, secret);
	if (!valid) return null;
	let payload: { id: string; email: string; name: string; picture: string; exp: number };
	try {
		payload = JSON.parse(payloadStr) as typeof payload;
	} catch {
		return null;
	}
	if (payload.exp < Math.floor(Date.now() / 1000)) return null;
	if (!payload.id || !payload.email) return null;
	return {
		id: payload.id,
		email: payload.email,
		name: payload.name ?? '',
		picture: payload.picture ?? ''
	};
}
