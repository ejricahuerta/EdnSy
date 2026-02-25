/**
 * One-off script to fetch Notion database schema and one page, then verify property mapping.
 * Run from repo root: node apps/marketing/scripts/check-notion-properties.mjs
 * Requires NOTION_API_KEY and NOTION_DATABASE_ID in apps/marketing/.env (script reads .env manually).
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');

function loadEnv() {
	try {
		const raw = readFileSync(envPath, 'utf8');
		const env = {};
		for (const line of raw.split('\n')) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith('#')) continue;
			const eq = trimmed.indexOf('=');
			if (eq === -1) continue;
			const key = trimmed.slice(0, eq).trim();
			const value = trimmed.slice(eq + 1).trim();
			env[key] = value;
		}
		return env;
	} catch (e) {
		console.error('Failed to read .env:', e.message);
		process.exit(1);
	}
}

const env = loadEnv();
const NOTION_API_KEY = env.NOTION_API_KEY;
const NOTION_DATABASE_ID = env.NOTION_DATABASE_ID;

if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
	console.error('Missing NOTION_API_KEY or NOTION_DATABASE_ID in apps/marketing/.env');
	process.exit(1);
}

const headers = {
	Authorization: `Bearer ${NOTION_API_KEY}`,
	'Notion-Version': '2022-06-28',
	'Content-Type': 'application/json'
};

async function main() {
	console.log('Fetching Notion database schema and first page...\n');

	const dbRes = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}`, { headers });
	if (!dbRes.ok) {
		console.error('Database fetch failed:', dbRes.status, await dbRes.text());
		process.exit(1);
	}
	const db = await dbRes.json();

	const queryRes = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
		method: 'POST',
		headers,
		body: JSON.stringify({ page_size: 1 })
	});
	if (!queryRes.ok) {
		console.error('Query failed:', queryRes.status, await queryRes.text());
		process.exit(1);
	}
	const query = await queryRes.json();
	const firstPage = query.results?.[0];

	console.log('=== DATABASE SCHEMA (property name → type) ===');
	const schema = db.properties || {};
	for (const [name, def] of Object.entries(schema)) {
		const type = def.type;
		console.log(`  "${name}" → ${type}`);
	}

	console.log('\n=== FIRST PAGE: raw property keys and value types ===');
	if (!firstPage) {
		console.log('  (no pages in database)');
	} else {
		const props = firstPage.properties || {};
		for (const [name, value] of Object.entries(props)) {
			const type = value.type;
			let preview = '';
			if (type === 'title' && value.title?.[0]) preview = value.title[0].plain_text;
			else if (type === 'rich_text' && value.rich_text?.[0]) preview = value.rich_text[0].plain_text;
			else if (type === 'url' && value.url) preview = value.url;
			else if (type === 'select' && value.select) preview = value.select.name;
			else if (type === 'status' && value.status) preview = value.status.name;
			else if (type === 'email' && value.email) preview = value.email;
			else if (type === 'phone_number' && value.phone_number) preview = value.phone_number;
			console.log(`  "${name}" (${type})${preview ? ` → "${preview.slice(0, 50)}${preview.length > 50 ? '...' : ''}"` : ''}`);
		}
	}

	console.log('\n=== PROPERTY MAPPING (notion.ts) ===');
	console.log('  companyName  ← title: "Name" | "Company" | "Company Name"');
	console.log('  email        ← email: "Email" | rich_text fallback');
	console.log('  website      ← url: "Website" | rich_text fallback');
	console.log('  phone        ← phone_number: "Phone" | rich_text fallback');
	console.log('  industry     ← select: "Industry" | "Vertical" → slug via src/lib/industryMapping.ts');
	console.log('  status       ← status: "Client Status" | "Demo Status"');
	console.log('  demoLink     ← rich_text: "Demo Link"');
	console.log('\n  Industry → slug: see src/lib/industryMapping.ts (NOTION_INDUSTRY_TO_SLUG)');
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
