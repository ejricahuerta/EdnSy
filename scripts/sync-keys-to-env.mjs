#!/usr/bin/env node
/**
 * Sync secrets from repo-root `.keys.json` into `apps/admin/.env.local`.
 *
 * GBP data is now via Google Places API. This script syncs GOOGLE_PLACES_API_KEY
 * from keys.google.placesApiKey or keys.google.apiKey so dev config stays consistent
 * without committing secrets.
 *
 * - Reads: <repo-root>/.keys.json
 * - Writes/updates: <repo-root>/apps/admin/.env.local
 * - Does NOT print secret values.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

function parseEnvFile(text) {
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

function upsertEnvKeys(existingText, updates) {
	const lines = existingText.split(/\r?\n/);
	const keys = Object.keys(updates);
	const seen = new Set();
	const out = lines.map((rawLine) => {
		const line = rawLine;
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) return line;
		const eq = trimmed.indexOf('=');
		if (eq === -1) return line;
		const key = trimmed.slice(0, eq).trim();
		if (!keys.includes(key)) return line;
		seen.add(key);
		return `${key}=${updates[key]}`;
	});

	for (const key of keys) {
		if (!seen.has(key)) out.push(`${key}=${updates[key]}`);
	}

	// Ensure trailing newline for POSIX-friendly env files
	return out.join('\n').replace(/\s+$/, '') + '\n';
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const keysPath = resolve(repoRoot, '.keys.json');
const targetEnvPath = resolve(repoRoot, 'apps/admin/.env.local');

if (!existsSync(keysPath)) {
	console.error(`Missing ${keysPath}. Nothing to sync.`);
	process.exit(1);
}

/** @type {any} */
let keys;
try {
	keys = JSON.parse(readFileSync(keysPath, 'utf8'));
} catch {
	console.error(`Could not parse ${keysPath}.`);
	process.exit(1);
}

const placesKey =
	String(keys?.google?.placesApiKey ?? keys?.google?.apiKey ?? '').trim();

const updates = {};
if (placesKey) updates.GOOGLE_PLACES_API_KEY = placesKey;

if (Object.keys(updates).length === 0) {
	console.log('No GBP/Places keys to sync (keys.google.placesApiKey or keys.google.apiKey).');
	process.exit(0);
}

const existingText = existsSync(targetEnvPath) ? readFileSync(targetEnvPath, 'utf8') : '';
const existingMap = parseEnvFile(existingText);

const updatedText = upsertEnvKeys(existingText, updates);

writeFileSync(targetEnvPath, updatedText, 'utf8');

const changed = Object.keys(updates).some((k) => existingMap[k] !== updates[k]);

console.log(
	`${changed ? 'Updated' : 'Verified'} ${targetEnvPath} (${Object.keys(updates).join(', ')}).`
);
