#!/usr/bin/env node
/**
 * Local mock for Vercel Cron: calls all cron endpoints on an interval so background jobs
 * run when the dev server is up (no Vercel Cron locally).
 *
 * Endpoints (same order as production):
 *   1. GET /api/cron/jobs/demo  (paid demo first, then free try demos)
 *   2. GET /api/cron/jobs/gbp   (GBP fetch for prospects)
 *
 * Usage (from repo root or apps/lead-rosetta):
 *   node scripts/cron-mock.mjs
 *   CRON_INTERVAL_MS=60000 node scripts/cron-mock.mjs   # default 60s
 *   BASE_URL=http://localhost:5173 node scripts/cron-mock.mjs
 *
 * Requires in .env or .env.local (apps/lead-rosetta): CRON_SECRET
 * Optional: BASE_URL (default http://localhost:5173), CRON_INTERVAL_MS (default 60000)
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

// Load from apps/lead-rosetta, then cwd so either works
loadEnvFromDir(leadRosettaRoot);
if (!process.env.CRON_SECRET) loadEnvFromDir(process.cwd());

const CRON_SECRET = (process.env.CRON_SECRET ?? '').trim();
const BASE_URL = (process.env.BASE_URL ?? 'http://localhost:5173').replace(/\/$/, '');
const CRON_INTERVAL_MS = Math.max(10000, parseInt(process.env.CRON_INTERVAL_MS || '60000', 10));

if (!CRON_SECRET) {
	console.error('Missing CRON_SECRET. Set it in apps/lead-rosetta/.env or .env.local (e.g. CRON_SECRET=my-local-cron-secret-16chars)');
	process.exit(1);
}

const CRON_ENDPOINTS = [
	{ path: '/api/cron/jobs/demo', label: 'demo' },
	{ path: '/api/cron/jobs/gbp', label: 'gbp' }
];

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
	const qStr = typeof q === 'object' && q !== null
		? `pending=${q.pending ?? '?'} running=${q.running ?? '?'}`
		: q ? String(q) : 'idle';
	return `[${time}] ${r.label}: queue ${qStr}`;
}

async function runAll() {
	for (const { path, label } of CRON_ENDPOINTS) {
		const result = await callCron(path, label);
		console.log(formatResult(result));
	}
}

console.log(`Mock cron: ${CRON_ENDPOINTS.map((e) => e.path).join(', ')} every ${CRON_INTERVAL_MS / 1000}s (Ctrl+C to stop)`);
await runAll();
setInterval(runAll, CRON_INTERVAL_MS);
