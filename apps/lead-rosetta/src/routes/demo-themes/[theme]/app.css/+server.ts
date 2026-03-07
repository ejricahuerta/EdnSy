/**
 * Serve v1.3 theme app.css from docs so demo page can load theme styles.
 */

import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { V13_THEMES } from '$lib/demo';

const THEMES_DIR = 'docs/style-guides-v1.3/themes';

export const GET: RequestHandler = async ({ params }) => {
	const theme = params.theme;
	if (!theme || !(V13_THEMES as readonly string[]).includes(theme)) {
		throw error(404, 'Theme not found');
	}
	// Resolve from project root (apps/lead-rosetta when run from there)
	const base = process.cwd();
	const appPath = join(base, THEMES_DIR, theme, 'app.css');
	const monorepoPath = join(base, 'apps', 'lead-rosetta', THEMES_DIR, theme, 'app.css');
	const path = existsSync(appPath) ? appPath : monorepoPath;
	if (!existsSync(path)) {
		throw error(404, 'Theme CSS not found');
	}
	const css = readFileSync(path, 'utf-8');
	return new Response(css, {
		headers: {
			'Content-Type': 'text/css',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
