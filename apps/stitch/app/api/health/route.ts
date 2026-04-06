import { NextResponse } from "next/server";

/**
 * GET /api/health — liveness for uptime monitors and cron warm pings (no auth).
 */
export async function GET() {
  return NextResponse.json({ ok: true, service: "stitch" });
}
