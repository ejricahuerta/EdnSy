import { NextResponse } from "next/server";
import { listTestSampleMeta } from "@/lib/test/test-samples-registry";

export const runtime = "nodejs";

/**
 * GET /api/test/samples — ids and labels for payloads under docs/ (no JSON bodies).
 */
export async function GET() {
  return NextResponse.json({ samples: listTestSampleMeta() });
}
