/**
 * Cloudflare Worker: runs on a schedule.
 * - Lead Rosetta: calls cron endpoints (demo, GBP). Set CRON_TARGET_URL (vars) and CRON_SECRET (secret).
 * - Pitch Rosetta: pings health endpoint to keep Render awake. Set PITCH_ROSETTA_URL (vars, optional).
 */

export interface Env {
	CRON_SECRET: string;
	CRON_TARGET_URL: string;
	PITCH_ROSETTA_URL?: string;
}

async function callCron(url: string, secret: string): Promise<{ ok: boolean; status: number; text: string }> {
	const res = await fetch(url, {
		method: "GET",
		headers: { Authorization: `Bearer ${secret}` },
	});
	const text = await res.text();
	return { ok: res.ok, status: res.status, text };
}

async function pingHealth(url: string): Promise<{ ok: boolean; status: number; text: string }> {
	const res = await fetch(url, { method: "GET" });
	const text = await res.text();
	return { ok: res.ok, status: res.status, text };
}

export default {
	async scheduled(
		controller: ScheduledController,
		env: Env,
		_ctx: ExecutionContext,
	): Promise<void> {
		switch (controller.cron) {
			case "*/1 * * * *": {
				const base = (env.CRON_TARGET_URL ?? "").replace(/\/$/, "");
				const secret = env.CRON_SECRET ?? "";
				if (!base || !secret) {
					console.error("[cron-worker] CRON_TARGET_URL and CRON_SECRET must be set");
					return;
				}
				const r = await callCron(`${base}/api/cron/jobs/demo`, secret);
				console.log(`[cron-worker] demo: ${r.status} ${r.ok ? "ok" : r.text}`);
				break;
			}
			case "*/2 * * * *": {
				const base = (env.CRON_TARGET_URL ?? "").replace(/\/$/, "");
				const secret = env.CRON_SECRET ?? "";
				if (!base || !secret) {
					console.error("[cron-worker] CRON_TARGET_URL and CRON_SECRET must be set");
					return;
				}
				const r = await callCron(`${base}/api/cron/jobs/gbp`, secret);
				console.log(`[cron-worker] gbp: ${r.status} ${r.ok ? "ok" : r.text}`);
				break;
			}
			case "*/14 * * * *": {
				const base = (env.PITCH_ROSETTA_URL ?? "https://pitch-rosetta.onrender.com").replace(/\/$/, "");
				const r = await pingHealth(`${base}/api/health`);
				console.log(`[cron-worker] pitch-rosetta: ${r.status} ${r.ok ? "ok" : r.text}`);
				break;
			}
			default:
				console.log(`[cron-worker] unknown cron: ${controller.cron}`);
		}
	},
};
