#!/usr/bin/env node
/**
 * Local mock for production cron: matches apps/cron-worker (single schedule, UTC minute branches).
 *
 * Each tick: demo every time; GBP / insights / batch / pitch when UTC minute matches the same
 * modulo rules as the Worker (2, 3, 5, 14). Pitch pings GET /api/health (no auth).
 *
 * Usage (from repo root or apps/lead-rosetta):
 *   node scripts/cron-mock.mjs
 *   CRON_INTERVAL_MS=60000 node scripts/cron-mock.mjs   # default 60s — use 60s for parity with Cloudflare
 *   BASE_URL=http://localhost:5173 node scripts/cron-mock.mjs
 *
 * Optional:
 *   PITCH_ROSETTA_URL — default https://pitch-rosetta.onrender.com
 *
 * Requires in .env or .env.local (apps/lead-rosetta): CRON_SECRET
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const leadRosettaRoot = resolve(repoRoot, 'apps', 'lead-rosetta');

function loadEnvFromDir(dir) {
	for (const name of ['.env', '.env.local']) {
		const path = resolve(dir, name);
		if (!existsSync(path)) continue;
		const raw = readFileSync(path, 'utf8').replace(/\uFEFF/, '');
		for (const line of raw.split(/\r?\n/)) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith('#')) continue;
			const eq = trimmed.indexOf('=');
			if (eq === -1) continue;
			const key = trimmed.slice(0, eq).trim();
			let value = trimmed.slice(eq + 1).trim();
			if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
				value = value.slice(1, -1);
			if (key) process.env[key] = value;
		}
	}
}

loadEnvFromDir(leadRosettaRoot);
if (!process.env.CRON_SECRET) loadEnvFromDir(process.cwd());

const CRON_SECRET = (process.env.CRON_SECRET ?? '').trim();
const BASE_URL = (process.env.BASE_URL ?? 'http://localhost:5173').replace(/\/$/, '');
const TICK_MS = Math.max(10000, parseInt(process.env.CRON_INTERVAL_MS || '60000', 10));
const PITCH_BASE = (process.env.PITCH_ROSETTA_URL ?? 'https://pitch-rosetta.onrender.com').replace(/\/$/, '');

if (!CRON_SECRET) {
	console.error('Missing CRON_SECRET. Set it in apps/lead-rosetta/.env or .env.local (e.g. CRON_SECRET=my-local-cron-secret-16chars)');
	process.exit(1);
}

if (TICK_MS !== 60000) {
	console.warn(
		`[cron-mock] CRON_INTERVAL_MS=${TICK_MS} — production Worker uses one trigger per 60s; sub-minute ticks will run Lead Rosetta jobs multiple times per UTC minute. Set CRON_INTERVAL_MS=60000 for parity.`
	);
}

const authHeader = { Authorization: `Bearer ${CRON_SECRET}` };

async function callCron(path, label) {
	const url = `${BASE_URL}${path}`;
	try {
		const res = await fetch(url, { method: 'GET', headers: authHeader });
		const body = await res.json().catch(() => ({}));
		if (res.status !== 200) {
			return { label, ok: false, status: res.status, error: body.error || body.message || 'Error' };
		}
		const processed = body.processed === true || (body.processedCount ?? 0) > 0;
		return { label, ok: true, processed, body };
	} catch (err) {
		return { label, ok: false, error: err.message };
	}
}

async function pingPitch() {
	const url = `${PITCH_BASE}/api/health`;
	try {
		const res = await fetch(url, { method: 'GET' });
		const text = await res.text().catch(() => '');
		return { ok: res.ok, status: res.status, text: text.slice(0, 200) };
	} catch (err) {
		return { ok: false, error: err.message };
	}
}

function formatResult(r) {
	const time = new Date().toISOString();
	if (!r.ok) {
		return `[${time}] ${r.label}: ${r.status ?? ''} ${r.error ?? 'fetch failed'}`;
	}
	if (r.processed) {
		const b = r.body || {};
		const status = b.status ?? '?';
		const extra = b.companyName ?? b.prospectId ?? b.freeDemoId ?? '';
		return `[${time}] ${r.label}: processed, status=${status}${extra ? ` (${extra})` : ''}`;
	}
	const q = r.body?.queueStatus;
	const qStr =
		typeof q === 'object' && q !== null
			? `pending=${q.pending ?? '?'} running=${q.running ?? '?'}`
			: q
				? String(q)
				: 'idle';
	return `[${time}] ${r.label}: queue ${qStr}`;
}

function formatPitch(r) {
	const time = new Date().toISOString();
	if (r.ok) return `[${time}] pitch-rosetta: ${r.status} ok`;
	return `[${time}] pitch-rosetta: ${r.status ?? ''} ${r.error ?? r.text ?? 'failed'}`;
}

async function tick() {
	const minute = new Date().getUTCMinutes();

	const rDemo = await callCron('/api/cron/jobs/demo', 'demo');
	console.log(formatResult(rDemo));

	if (minute % 2 === 0) {
		const r = await callCron('/api/cron/jobs/gbp', 'gbp');
		console.log(formatResult(r));
	}
	if (minute % 3 === 0) {
		const r = await callCron('/api/cron/jobs/insights', 'insights');
		console.log(formatResult(r));
	}
	if (minute % 5 === 0) {
		const r = await callCron('/api/cron/schedule/batch', 'schedule/batch');
		console.log(formatResult(r));
	}
	if (minute % 14 === 0) {
		const r = await pingPitch();
		console.log(formatPitch(r));
	}
}

console.log(
	`Mock cron (Worker parity): BASE_URL=${BASE_URL} | tick=${Math.round(TICK_MS / 1000)}s | pitch=${PITCH_BASE} (Ctrl+C to stop)`
);

await tick();
setInterval(tick, TICK_MS);
