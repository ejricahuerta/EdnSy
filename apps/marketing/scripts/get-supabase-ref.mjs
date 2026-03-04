import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const envPath = join(process.cwd(), '.env');
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
