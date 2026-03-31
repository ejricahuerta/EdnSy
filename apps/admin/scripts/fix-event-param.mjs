import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminRoot = path.resolve(__dirname, '..');

function walk(d, out = []) {
	for (const e of fs.readdirSync(d, { withFileTypes: true })) {
		const p = path.join(d, e.name);
		if (e.isDirectory() && e.name !== 'node_modules') walk(p, out);
		else if (e.isFile() && p.endsWith('.ts')) out.push(p);
	}
	return out;
}

const files = walk(path.join(adminRoot, 'src/routes')).filter(
	(f) => f.includes('+page.server') || f.includes('+server.ts')
);

for (const fp of files) {
	let s = fs.readFileSync(fp, 'utf8');
	const orig = s;
	// load: ({ cookies }) -> (event) when body uses getDashboardSessionUser(event)
	if (s.includes('getDashboardSessionUser(event)')) {
		s = s.replace(
			/export const load: PageServerLoad = async \(\{ cookies \}\) => \{/g,
			'export const load: PageServerLoad = async (event) => {'
		);
		s = s.replace(
			/export const load: PageServerLoad = async \(\{ params, cookies \}\) => \{/g,
			'export const load: PageServerLoad = async (event) => {\n\tconst { params, cookies } = event;'
		);
	}
	// RequestHandler patterns
	s = s.replace(
		/export const (GET|POST|PUT|DELETE|PATCH): RequestHandler = async \(\{ cookies, params \}\) => \{/g,
		'export const $1: RequestHandler = async (event) => {\n\tconst { cookies, params } = event;'
	);
	s = s.replace(
		/export const POST: RequestHandler = async \(\{ cookies, url \}\) => \{/g,
		'export const POST: RequestHandler = async (event) => {\n\tconst { cookies, url } = event;'
	);
	s = s.replace(
		/export const POST: RequestHandler = async \(\{ request, cookies \}\) => \{/g,
		'export const POST: RequestHandler = async (event) => {\n\tconst { request, cookies } = event;'
	);
	s = s.replace(
		/export const POST: RequestHandler = async \(\{ request, cookies, url \}\) => \{/g,
		'export const POST: RequestHandler = async (event) => {\n\tconst { request, cookies, url } = event;'
	);
	s = s.replace(
		/export const POST: RequestHandler = async \(\{ cookies \}\) => \{/g,
		'export const POST: RequestHandler = async (event) => {\n\tconst { cookies } = event;'
	);
	if (s !== orig) {
		fs.writeFileSync(fp, s);
		console.log('fixed', path.relative(adminRoot, fp));
	}
}
