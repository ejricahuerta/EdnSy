#!/usr/bin/env node
/**
 * Test DataForSEO my_business_info (GBP) API using app env vars.
 *
 * Prefers `apps/marketing/.env.local` (DATAFORSEO_LOGIN/PASSWORD).
 * Falls back to repo-root `.keys.json` (dataforseo.login/password).
 * Writes POST response and final result to a directory with a custom name.
 *
 * Run from repo root:
 *   node apps/marketing/scripts/test-dataforseo-gbp.mjs <output-dir-name> [keyword] [location_name]
 * Example:
 *   node apps/marketing/scripts/test-dataforseo-gbp.mjs my-gbp-test "Taylor Tire" "Toronto,Ontario,Canada"
 * Output: apps/marketing/scripts/output/my-gbp-test/post.json, result.json
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../../..');
const envPath = resolve(root, 'apps/marketing/.env.local');
const keysPath = resolve(root, '.keys.json');

function parseEnv(text) {
	/** @type {Record<string, string>} */
	const out = {};
	for (const rawLine of text.split(/\r?\n/)) {
		const line = rawLine.trim();
		if (!line || line.startsWith('#')) continue;
		const eq = line.indexOf('=');
		if (eq === -1) continue;
		const key = line.slice(0, eq).trim();
		let value = line.slice(eq + 1).trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}
		if (key) out[key] = value;
	}
	return out;
}

let login = '';
let password = '';

try {
	const envText = readFileSync(envPath, 'utf8');
	const env = parseEnv(envText);
	login = (env.DATAFORSEO_LOGIN ?? '').trim();
	password = (env.DATAFORSEO_PASSWORD ?? '').trim();
} catch {
	// ignore; fall back to .keys.json below
}

if (!login || !password) {
	const keys = JSON.parse(readFileSync(keysPath, 'utf8'));
	login = String(keys?.dataforseo?.login ?? '').trim();
	password = String(keys?.dataforseo?.password ?? '').trim();
}

if (!login || !password) {
	console.error(
		'Missing DataForSEO credentials. Set DATAFORSEO_LOGIN/PASSWORD in apps/marketing/.env.local or add dataforseo.login/password to .keys.json.'
	);
	process.exit(1);
}

const auth = Buffer.from(`${login}:${password}`, 'utf8').toString('base64');
const headers = {
	Authorization: `Basic ${auth}`,
	'Content-Type': 'application/json'
};
const base = 'https://api.dataforseo.com/v3/business_data/google/my_business_info';

const outDirName = process.argv[2]?.trim() || 'dataforseo-gbp-test';
const keyword = process.argv[3]?.trim() || 'Taylor Tire';
const locationName = process.argv[4]?.trim() || 'Toronto,Ontario,Canada';
const languageCode = 'en';
const outputDir = resolve(__dirname, 'output', outDirName);
mkdirSync(outputDir, { recursive: true });
console.log('Output dir:', outputDir);

const body = [{ keyword, location_name: locationName, language_code: languageCode }];

console.log(`POST task_post (${keyword}, ${locationName})...`);
const postRes = await fetch(`${base}/task_post`, {
	method: 'POST',
	headers,
	body: JSON.stringify(body)
});
const post = await postRes.json();
writeFileSync(resolve(outputDir, 'post.json'), JSON.stringify(post, null, 2));
console.log(JSON.stringify(post, null, 2));

const taskId = post?.tasks?.[0]?.id;
if (!taskId) {
	console.error('No task id in response.');
	process.exit(1);
}

/** Terminal codes: task finished (success or error). 20100/40601/40602 = still processing. */
const TERMINAL_CODES = new Set([20000, 40100, 40101, 40102, 40103, 40200, 40400, 40401, 40402, 40403, 40501, 40502, 40503, 50000, 50100, 50301, 50401]);

console.log('\nPolling task_get every 3s (max 60s)...');
const deadline = Date.now() + 60_000;
while (Date.now() < deadline) {
	await new Promise((r) => setTimeout(r, 3000));
	const getRes = await fetch(`${base}/task_get/${taskId}`, { headers });
	const get = await getRes.json();
	const task = get?.tasks?.[0];
	const status = task?.status_code;
	const msg = task?.status_message ?? '';
	console.log('  status_code:', status, msg ? `(${msg})` : '');
	writeFileSync(resolve(outputDir, 'result.json'), JSON.stringify(get, null, 2));
	if (status === 20000) {
		const items = task?.result?.[0]?.items ?? [];
		console.log('\nResult written to', resolve(outputDir, 'result.json'));
		console.log('Items:', items.length);
		console.log(JSON.stringify(get, null, 2));
		process.exit(0);
	}
	if (status === 40102) {
		console.log('\n40102 No Search Results – DataForSEO found no GBP for this keyword/location. Result saved to', resolve(outputDir, 'result.json'));
		process.exit(2);
	}
	if (TERMINAL_CODES.has(status)) {
		console.error('\nTerminal status', status, msg || '– see result.json');
		process.exit(1);
	}
}
console.error('Timeout.');
process.exit(1);
