import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminRoot = path.resolve(__dirname, '..');

function walk(d, out = []) {
	for (const e of fs.readdirSync(d, { withFileTypes: true })) {
		const p = path.join(d, e.name);
		if (e.isDirectory() && e.name !== 'node_modules') walk(p, out);
		else if (e.isFile() && p.endsWith('+page.server.ts')) out.push(p);
	}
	return out;
}

const replacements = [
	[
		/(\t[a-zA-Z0-9_]+: )async \(\{ request, url, cookies \}\) => \{\r?\n(\t\tconst user = await getDashboardSessionUser\(event\);)/g,
		'$1async (event) => {\r\n\t\tconst { request, url, cookies } = event;\r\n$2'
	],
	[
		/(\t[a-zA-Z0-9_]+: )async \(\{ request, cookies \}\) => \{\r?\n(\t\tconst user = await getDashboardSessionUser\(event\);)/g,
		'$1async (event) => {\r\n\t\tconst { request, cookies } = event;\r\n$2'
	],
	[
		/(\t[a-zA-Z0-9_]+: )async \(\{ cookies \}\) => \{\r?\n(\t\tconst user = await getDashboardSessionUser\(event\);)/g,
		'$1async (event) => {\r\n\t\tconst { cookies } = event;\r\n$2'
	],
	[
		/(\tdefault: )async \(\{ request, cookies \}\) => \{\r?\n(\t\tconst user = await getDashboardSessionUser\(event\);)/g,
		'$1async (event) => {\r\n\t\tconst { request, cookies } = event;\r\n$2'
	]
];

for (const fp of walk(path.join(adminRoot, 'src/routes'))) {
	let s = fs.readFileSync(fp, 'utf8');
	const orig = s;
	for (const [re, rep] of replacements) {
		s = s.replace(re, rep);
	}
	if (s !== orig) {
		fs.writeFileSync(fp, s);
		console.log('fixed actions', path.relative(adminRoot, fp));
	}
}
