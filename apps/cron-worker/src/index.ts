/**
 * Cloudflare Worker: runs on a schedule and calls the lead-rosetta app cron endpoints.
 * Replaces Vercel Cron to avoid limits. Set CRON_TARGET_URL (vars) and CRON_SECRET (secret).
 */

export interface Env {
	CRON_SECRET: string;
	CRON_TARGET_URL: string;
}

async function callCron(url: string, secret: string): Promise<{ ok: boolean; status: number; text: string }> {
	const res = await fetch(url, {
		method: "GET",
		headers: { Authorization: `Bearer ${secret}` },
	});
	const text = await res.text();
	return { ok: res.ok, status: res.status, text };
}

export default {
	async scheduled(
		controller: ScheduledController,
		env: Env,
		_ctx: ExecutionContext,
	): Promise<void> {
		const base = (env.CRON_TARGET_URL ?? "").replace(/\/$/, "");
		const secret = env.CRON_SECRET ?? "";
		if (!base || !secret) {
			console.error("[cron-worker] CRON_TARGET_URL and CRON_SECRET must be set");
			return;
		}

		switch (controller.cron) {
			case "*/1 * * * *": {
				const r = await callCron(`${base}/api/cron/jobs/demo`, secret);
				console.log(`[cron-worker] demo: ${r.status} ${r.ok ? "ok" : r.text}`);
				break;
			}
			case "*/2 * * * *": {
				const r = await callCron(`${base}/api/cron/jobs/gbp`, secret);
				console.log(`[cron-worker] gbp: ${r.status} ${r.ok ? "ok" : r.text}`);
				break;
			}
			default:
				console.log(`[cron-worker] unknown cron: ${controller.cron}`);
		}
	},
};
