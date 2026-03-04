/**
 * Download Unsplash demo images to static/images/demo/{industry}/
 * Run from apps/marketing: node scripts/download-demo-images.mjs
 * Uses high-quality default Unsplash URLs (same as unsplash.ts). Set UNSPLASH_ACCESS_KEY
 * to optionally fetch alternate images via search query per industry.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATIC_IMAGES = path.join(__dirname, '..', 'static', 'images', 'demo');

const INDUSTRIES = [
	'healthcare',
	'dental',
	'construction',
	'salons',
	'professional',
	'real-estate',
	'legal',
	'fitness'
];

/** Default hero/about Unsplash URLs per industry (match unsplash.ts). */
const DEFAULT_IMAGES = {
	healthcare: {
		hero: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&q=80',
		about: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80'
	},
	dental: {
		hero: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&q=80',
		about: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80'
	},
	construction: {
		hero: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80',
		about: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80'
	},
	salons: {
		hero: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80',
		about: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80'
	},
	professional: {
		hero: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
		about: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80'
	},
	'real-estate': {
		hero: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80',
		about: 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&q=80'
	},
	legal: {
		hero: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=80',
		about: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80'
	},
	fitness: {
		hero: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
		about: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80'
	}
};

async function download(url, filePath) {
	const res = await fetch(url, { redirect: 'follow' });
	if (!res.ok) throw new Error(`${url} => ${res.status}`);
	const buf = Buffer.from(await res.arrayBuffer());
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.writeFileSync(filePath, buf);
}

async function main() {
	console.log('Downloading demo images to static/images/demo/...');
	for (const industry of INDUSTRIES) {
		const urls = DEFAULT_IMAGES[industry];
		if (!urls) continue;
		const dir = path.join(STATIC_IMAGES, industry);
		try {
			await download(urls.hero, path.join(dir, 'hero.jpg'));
			console.log(`  ${industry}/hero.jpg`);
			await download(urls.about, path.join(dir, 'about.jpg'));
			console.log(`  ${industry}/about.jpg`);
		} catch (e) {
			console.error(`  ${industry}: ${e.message}`);
		}
	}
	console.log('Done.');
}

main();
