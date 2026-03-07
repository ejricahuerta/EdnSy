import { readFileSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const leadRosettaRoot = resolve(__dirname, '..', 'apps', 'lead-rosetta');
const envPath = join(leadRosettaRoot, '.env');

if (!existsSync(envPath)) {
	console.log('NO_ENV');
	process.exit(1);
}
const content = readFileSync(envPath, 'utf8');
const line = content.split('\n').find((l) => l.startsWith('SUPABASE_URL='));
if (!line) {
	console.log('NO_URL');
	process.exit(1);
}
const url = line.replace('SUPABASE_URL=', '').trim();
const ref = url.replace(/^https?:\/\//, '').split('.')[0];
console.log(ref);
