import { readFile } from 'node:fs/promises';
import { extname, normalize, resolve, sep } from 'node:path';

const PITCH_ROOT = resolve(process.cwd(), '..', 'pitch-rosetta');
const PITCH_IMAGES_ROOT = resolve(PITCH_ROOT, 'images');

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
	'.avif': 'image/avif',
	'.gif': 'image/gif',
	'.jpeg': 'image/jpeg',
	'.jpg': 'image/jpeg',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.webp': 'image/webp'
};

function resolveSafeAssetPath(root: string, requestedPath: string): string | null {
	const normalized = normalize(requestedPath).replace(/^([/\\])+/, '');
	const absolutePath = resolve(root, normalized);
	if (absolutePath !== root && !absolutePath.startsWith(`${root}${sep}`)) return null;
	return absolutePath;
}

export async function loadPitchRosettaAsset(requestedPath: string): Promise<{ data: Uint8Array; contentType: string } | null> {
	const assetPath = resolveSafeAssetPath(PITCH_IMAGES_ROOT, requestedPath);
	if (!assetPath) return null;

	try {
		const data = await readFile(assetPath);
		const ext = extname(assetPath).toLowerCase();
		const contentType = CONTENT_TYPE_BY_EXT[ext] ?? 'application/octet-stream';
		return { data, contentType };
	} catch {
		return null;
	}
}
