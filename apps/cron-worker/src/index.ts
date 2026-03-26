/// <reference types="@cloudflare/workers-types" />

/**
 * Cloudflare Worker: runs on a schedule.
 * - Lead Rosetta: calls cron endpoints (demo, GBP, insights, batch). Set CRON_TARGET_URL (vars) and CRON_SECRET (secret).
 * - Pitch Rosetta: pings health endpoint to keep Render awake. Set PITCH_ROSETTA_URL (vars, optional).
 *
 * One Cron Trigger (every minute) plus UTC minute modulo matches separate 1/2/3/5/14 minute schedules
 * and stays under the Free tier cap of 5 Cron Triggers per account (see Cloudflare Workers limits).
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
	async scheduled(controller: ScheduledController, env: Env, _ctx: ExecutionContext): Promise<void> {
		const base = (env.CRON_TARGET_URL ?? "").replace(/\/$/, "");
		const secret = env.CRON_SECRET ?? "";

		// scheduledTime is when this run was scheduled (ms). Use UTC minute for modulo alignment with each N-minute cron.
		const minute = new Date(controller.scheduledTime).getUTCMinutes();

		// Lead Rosetta: every minute
		if (base && secret) {
			const rDemo = await callCron(`${base}/api/cron/jobs/demo`, secret);
			console.log(`[cron-worker] demo: ${rDemo.status} ${rDemo.ok ? "ok" : rDemo.text}`);

			// Every 2 min (GBP)
			if (minute % 2 === 0) {
				const r = await callCron(`${base}/api/cron/jobs/gbp`, secret);
				console.log(`[cron-worker] gbp: ${r.status} ${r.ok ? "ok" : r.text}`);
			}
			// Every 3 min (insights)
			if (minute % 3 === 0) {
				const r = await callCron(`${base}/api/cron/jobs/insights`, secret);
				console.log(`[cron-worker] insights: ${r.status} ${r.ok ? "ok" : r.text}`);
			}
			// Every 5 min (batch enqueue)
			if (minute % 5 === 0) {
				const r = await callCron(`${base}/api/cron/schedule/batch`, secret);
				console.log(`[cron-worker] schedule/batch: ${r.status} ${r.ok ? "ok" : r.text}`);
			}
		} else {
			console.error("[cron-worker] CRON_TARGET_URL and CRON_SECRET must be set for Lead Rosetta crons");
		}

		// Every 14 min: Pitch Rosetta warm (minute 0, 14, 28, 42, 56 UTC)
		if (minute % 14 === 0) {
			const pitchBase = (env.PITCH_ROSETTA_URL ?? "https://pitch-rosetta.onrender.com").replace(/\/$/, "");
			const r = await pingHealth(`${pitchBase}/api/health`);
			console.log(`[cron-worker] pitch-rosetta: ${r.status} ${r.ok ? "ok" : r.text}`);
		}
	},
};
