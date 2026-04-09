/// <reference types="@cloudflare/workers-types" />

/**
 * Cloudflare Worker: runs on a schedule.
 * - Admin app: calls cron endpoints (demo, apify, GBP, insights, batch). Set CRON_TARGET_URL (vars) and CRON_SECRET (secret).
 * - Website Template: pings health endpoint to keep the service warm. Set WEBSITE_TEMPLATE_URL (vars, optional).
 * - Stitch (Render): pings GET /api/health to keep the service warm. Set STITCH_URL (vars, optional).
 *
 * One Cron Trigger (every minute) plus UTC minute modulo matches separate 1/2/3/5/14 minute schedules
 * and stays under the Free tier cap of 5 Cron Triggers per account (see Cloudflare Workers limits).
 */

export interface Env {
	CRON_SECRET: string;
	CRON_TARGET_URL: string;
	WEBSITE_TEMPLATE_URL?: string;
	/** Base URL for Stitch on Render (GET /api/health). */
	STITCH_URL?: string;
}

/** Avoid http→https redirects: fetch may drop Authorization on redirect, so cron gets 401. */
function normalizeCronBase(url: string): string {
	const trimmed = url.trim().replace(/\/$/, '');
	if (!trimmed) return '';
	try {
		const u = new URL(trimmed);
		const host = u.hostname.toLowerCase();
		const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
		if (u.protocol === 'http:' && !isLocal) {
			u.protocol = 'https:';
			return u.toString().replace(/\/$/, '');
		}
	} catch {
		return trimmed;
	}
	return trimmed;
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
		// Trim: pasted secrets/URLs often include trailing newlines; Vercel trims CRON_SECRET so Bearer would mismatch.
		const base = normalizeCronBase(env.CRON_TARGET_URL ?? "");
		const secret = (env.CRON_SECRET ?? "").trim();

		// scheduledTime is when this run was scheduled (ms). Use UTC minute for modulo alignment with each N-minute cron.
		const minute = new Date(controller.scheduledTime).getUTCMinutes();

		// Admin app: every minute
		if (base && secret) {
			const rDemo = await callCron(`${base}/api/cron/jobs/demo`, secret);
			console.log(`[cron-worker] demo: ${rDemo.status} ${rDemo.ok ? "ok" : rDemo.text}`);

			const rApify = await callCron(`${base}/api/cron/jobs/apify`, secret);
			console.log(`[cron-worker] apify: ${rApify.status} ${rApify.ok ? "ok" : rApify.text}`);

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
			const hasUrl = Boolean((env.CRON_TARGET_URL ?? "").trim());
			const hasSecret = Boolean((env.CRON_SECRET ?? "").trim());
			console.error(
				`[cron-worker] admin crons skipped: CRON_TARGET_URL ${hasUrl ? "set" : "MISSING"}, CRON_SECRET ${hasSecret ? "set" : "MISSING"} (set via wrangler secret put CRON_SECRET; must match Vercel)`
			);
		}

		// Every 14 min: Website Template warm (minute 0, 14, 28, 42, 56 UTC)
		if (minute % 14 === 0) {
			const websiteTemplateBase = normalizeCronBase(
				(env.WEBSITE_TEMPLATE_URL ?? "https://website-template.ednsy.com").trim()
			);
			const r = await pingHealth(`${websiteTemplateBase}/api/health`);
			console.log(`[cron-worker] website-template: ${r.status} ${r.ok ? "ok" : r.text}`);

			const stitchBase = normalizeCronBase((env.STITCH_URL ?? "https://stitch-svw5.onrender.com").trim());
			if (stitchBase) {
				const rStitch = await pingHealth(`${stitchBase}/api/health`);
				console.log(`[cron-worker] stitch: ${rStitch.status} ${rStitch.ok ? "ok" : rStitch.text.slice(0, 200)}`);
			}
		}
	},
};
