import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminRoot = path.resolve(__dirname, '..');

const files = [
	'src/routes/show/+page.server.ts',
	'src/routes/dashboard/settings/profile/+page.server.ts',
	'src/routes/dashboard/settings/email/templates/custom/+page.server.ts',
	'src/routes/dashboard/settings/email/+page.server.ts',
	'src/routes/dashboard/settings/demo-banner/+page.server.ts',
	'src/routes/dashboard/settings/+page.server.ts',
	'src/routes/dashboard/prospects/[id]/+page.server.ts',
	'src/routes/dashboard/integrations/+page.server.ts',
	'src/routes/dashboard/insights/+page.server.ts',
	'src/routes/dashboard/demos/+page.server.ts',
	'src/routes/dashboard/billing/+page.server.ts',
	'src/routes/dashboard/agents/+page.server.ts',
	'src/routes/api/stripe/portal/+server.ts',
	'src/routes/api/stripe/checkout/+server.ts',
	'src/routes/api/jobs/insights/+server.ts',
	'src/routes/api/jobs/gbp/+server.ts',
	'src/routes/api/jobs/demo/+server.ts',
	'src/routes/api/dashboard/overview/+server.ts',
	'src/routes/api/dashboard/integrations/credentials/[provider]/+server.ts',
	'src/routes/api/chat/crm/+server.ts'
];

const oldImport = `import { getSessionFromCookie, getSessionCookieName } from '$lib/server/session';`;
const newImport = `import { getDashboardSessionUser } from '$lib/server/authDashboard';`;

const cookieBlock =
	/\tconst cookie = cookies\.get\(getSessionCookieName\(\)\);\r?\n\tconst user = await getSessionFromCookie\(cookie\);/g;
const cookieBlockActions =
	/\t\tconst cookie = cookies\.get\(getSessionCookieName\(\)\);\r?\n\t\tconst user = await getSessionFromCookie\(cookie\);/g;

for (const rel of files) {
	const fp = path.join(adminRoot, rel);
	let s = fs.readFileSync(fp, 'utf8');
	if (!s.includes('getSessionFromCookie')) continue;
	s = s.replace(oldImport, newImport);
	s = s.replace(cookieBlockActions, '\t\tconst user = await getDashboardSessionUser(event);');
	s = s.replace(cookieBlock, '\tconst user = await getDashboardSessionUser(event);');
	// show page one-liner
	s = s.replace(
		/await getSessionFromCookie\(cookies\.get\(getSessionCookieName\(\)\)\)/g,
		'await getDashboardSessionUser(event)'
	);
	fs.writeFileSync(fp, s);
	console.log('patched', rel);
}
