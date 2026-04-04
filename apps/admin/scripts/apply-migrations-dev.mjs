#!/usr/bin/env node
/**
 * Apply `supabase/migrations_dev/*.sql` in filename order against direct Postgres.
 * This is the dev-schema counterpart to `supabase db push` (which only tracks `supabase/migrations/`).
 *
 * Uses the same `apps/admin/.env` as other admin scripts (see pull-gbp-dental.mjs).
 * Postgres URI: set alongside your other Supabase vars — `SUPABASE_DATABASE_URL` (preferred),
 * or `SUPABASE_DB_URL`, `SUPABASE_DIRECT_URL`, `SUPABASE_DB_DIRECT_URL`, `DATABASE_URL`.
 * That URI is from Dashboard → Database (not `SUPABASE_URL`, which is the HTTPS API base).
 */
import { config } from 'dotenv';
import { readFile, readdir } from 'fs/promises';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env') });

function getPostgresConnectionUrl() {
	const candidates = [
		process.env.SUPABASE_DATABASE_URL,
		process.env.SUPABASE_DB_URL,
		process.env.SUPABASE_DIRECT_URL,
		process.env.SUPABASE_DB_DIRECT_URL,
		process.env.DATABASE_URL
	];
	for (const c of candidates) {
		const t = (c ?? '').trim();
		if (t) return t;
	}
	return '';
}

const url = getPostgresConnectionUrl();
if (!url) {
	console.error(
		'Missing Postgres connection string for dev migrations. In apps/admin/.env set SUPABASE_DATABASE_URL ' +
			'(URI from Supabase Dashboard → Database). Alternatives: SUPABASE_DB_URL, SUPABASE_DIRECT_URL, ' +
			'SUPABASE_DB_DIRECT_URL, DATABASE_URL. Note: SUPABASE_URL is the REST API URL, not Postgres.'
	);
	process.exit(1);
}

const dir = resolve(__dirname, '../supabase/migrations_dev');
const files = (await readdir(dir))
	.filter((f) => f.endsWith('.sql'))
	.sort();

if (files.length === 0) {
	console.log('No .sql files in supabase/migrations_dev/ (README only). Nothing to apply.');
	process.exit(0);
}

// Avoid printing Postgres NOTICE lines (e.g. "schema dev already exists" on re-runs).
const sql = postgres(url, { max: 1, onnotice: () => {} });
try {
	for (const name of files) {
		const filePath = resolve(dir, name);
		const body = await readFile(filePath, 'utf8');
		console.log('Applying', name);
		await sql.unsafe(body);
	}
	console.log('Applied', files.length, 'dev migration file(s).');
} catch (err) {
	const code = err?.code ?? err?.cause?.code;
	if (code === 'ENOTFOUND') {
		let host = '';
		try {
			host = new URL(url.replace(/^postgresql:\/\//i, 'http://')).hostname;
		} catch {
			/* ignore */
		}
		console.error(
			`[db:push:dev] DNS failed for the database host${host ? ` (${host})` : ''} (ENOTFOUND).`
		);
		console.error('  • Paste the URI from Supabase Dashboard → Project Settings → Database (URI tab).');
		console.error('  • Prefer "Session pooler" or "Direct connection" as shown there; hostnames differ by project.');
		console.error('  • Confirm the project ref matches SUPABASE_URL (e.g. https://<ref>.supabase.co).');
		console.error('  • Unpause the project if idle; check VPN/DNS if the dashboard loads but CLI fails.');
	} else {
		console.error('[db:push:dev]', err?.message ?? err);
	}
	process.exitCode = 1;
} finally {
	await sql.end({ timeout: 5 }).catch(() => {});
}

if (process.exitCode === 1) process.exit(1);
