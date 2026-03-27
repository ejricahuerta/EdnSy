import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { loadPitchRosettaAsset } from '$lib/server/pitchRosettaAssets';

export const GET: RequestHandler = async ({ params }) => {
	const requestedPath = params.path?.trim();
	if (!requestedPath) throw error(404, 'Not found');

	const asset = await loadPitchRosettaAsset(requestedPath);
	if (!asset) throw error(404, 'Not found');

	return new Response(asset.data, {
		headers: {
			'Content-Type': asset.contentType,
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
