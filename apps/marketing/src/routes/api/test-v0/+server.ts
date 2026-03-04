/**
 * One-off test for v0-sdk: creates a chat with a simple message and returns
 * id, demo URL, and file count. Use GET /api/test-v0 to verify V0_API_KEY.
 */

import { createClient } from 'v0-sdk';
import { env } from '$env/dynamic/private';
import { apiError, apiSuccess } from '$lib/server/apiResponse';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const apiKey = (env.V0_API_KEY ?? '').trim();
	if (!apiKey) {
		return apiError(500, 'V0_API_KEY not set');
	}

	try {
		const v0 = createClient({ apiKey });
		const chat = await v0.chats.create({
			message: 'Build a todo app with React and TypeScript'
		});

		// Response can be ChatDetail or a stream; we expect sync response
		if (chat && typeof chat === 'object' && 'id' in chat) {
			const demoUrl =
				(chat as { latestVersion?: { demoUrl?: string } }).latestVersion?.demoUrl ??
				(chat as { demo?: string }).demo;
			const files = (chat as { files?: unknown[] }).files ?? [];
			return apiSuccess({
				ok: true,
				chatId: (chat as { id: string }).id,
				webUrl: (chat as { webUrl?: string }).webUrl,
				demoUrl: demoUrl ?? null,
				fileCount: files.length,
				fileNames: files.map((f: { name?: string }) => f?.name ?? '(unknown)')
			});
		}

		return apiError(502, 'Unexpected response shape');
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		console.error('[api/test-v0]', msg);
		return apiError(500, msg);
	}
};
