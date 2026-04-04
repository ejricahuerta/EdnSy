#!/usr/bin/env node
/**
 * Regenerate supabase/migrations_dev/*.sql from supabase/migrations/*.sql for schema `dev`.
 * Preserves README.md and any migrations_dev/*.sql with no twin in migrations/ (e.g. bootstrap).
 *
 * Run from apps/admin: pnpm run db:sync-migrations-dev
 */
import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { dirname, resolve, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = resolve(__dirname, '../supabase/migrations');
const migrationsDevDir = resolve(__dirname, '../supabase/migrations_dev');

function transformPublicToDev(content, filename) {
	let s = content;

	// Function body search_path
	s = s.replace(/\bset\s+search_path\s*=\s*public\b/gi, 'set search_path = dev');

	// Schema-qualified objects
	s = s.replace(/\bpublic\./g, 'dev.');

	// pg_policies / information_schema string filters
	s = s.replace(/schemaname\s*=\s*'public'/g, "schemaname = 'dev'");
	s = s.replace(/table_schema\s*=\s*'public'/g, "table_schema = 'dev'");

	// Idempotent Realtime publication (db:push:dev may re-run all files)
	s = s.replace(
		/alter\s+publication\s+supabase_realtime\s+add\s+table\s+dev\.(\w+)\s*;/gi,
		(_, tbl) => `do $pub$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'dev' and tablename = '${tbl}'
  ) then
    execute 'alter publication supabase_realtime add table dev.${tbl}';
  end if;
end
$pub$;
`
	);

	const header = `-- Twin of supabase/migrations/${filename} targeting schema dev.
-- Regenerate: pnpm run db:sync-migrations-dev
-- Apply: pnpm run db:push:dev (with SUPABASE_DATABASE_URL)

`;

	return header + s.trimEnd() + '\n';
}

const names = (await readdir(migrationsDir))
	.filter((f) => f.endsWith('.sql'))
	.sort();

await mkdir(migrationsDevDir, { recursive: true });

for (const name of names) {
	const raw = await readFile(resolve(migrationsDir, name), 'utf8');
	const out = transformPublicToDev(raw, name);
	await writeFile(resolve(migrationsDevDir, name), out, 'utf8');
	console.log('Wrote migrations_dev/', name);
}

console.log('Done.', names.length, 'file(s).');
