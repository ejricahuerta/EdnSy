import { StitchError } from "@google/stitch-sdk";
import { NextResponse } from "next/server";
import { buildTestPromptFromPayload } from "@/lib/test/build-test-prompt";
import { resolveTestSample } from "@/lib/test/test-samples-registry";
import {
  StitchDailyQuotaExceededError,
  stitchDailyQuotaToHttpStatus,
  withDailyGenerationQuota,
} from "@/lib/stitch/daily-generation-quota";
import {
  generateScreenHtml,
  stitchErrorToHttpStatus,
} from "@/lib/stitch/generate-screen-html";
import { getOrCreateLaunchRosettaProject } from "@/lib/stitch/launch-rosetta";
import { StitchConfigError } from "@/lib/stitch/load-env";

export const runtime = "nodejs";

function parseSampleIdFromBody(text: string): string | undefined {
  const trimmed = text.trim();
  if (!trimmed) return undefined;
  const parsed = JSON.parse(trimmed) as { sampleId?: unknown };
  if (parsed.sampleId === undefined || parsed.sampleId === null) {
    return undefined;
  }
  if (typeof parsed.sampleId !== "string") {
    throw new Error("sampleId must be a string when provided");
  }
  return parsed.sampleId;
}

/**
 * POST /api/test — Stitch generation using docs one-liner + a test JSON payload.
 * Body (optional JSON): `{ "sampleId": "downtown-dental" }`. Omit or `{}` to pick a random sample.
 * See GET /api/test/samples for ids.
 */
export async function POST(request: Request) {
  let sampleId: string | undefined;
  try {
    const text = await request.text();
    if (text.trim()) {
      sampleId = parseSampleIdFromBody(text);
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid JSON body";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  let sample: ReturnType<typeof resolveTestSample>;
  try {
    sample = resolveTestSample(sampleId);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid sample";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const project = await getOrCreateLaunchRosettaProject();
    const prompt = buildTestPromptFromPayload(sample.payload);
    const result = await withDailyGenerationQuota(() =>
      generateScreenHtml(project, prompt),
    );
    return NextResponse.json({
      sampleId: sample.id,
      sampleLabel: sample.label,
      source: `docs/${sample.file} + docs/references/landing-page-prompt-one-liner.txt`,
      ...result,
    });
  } catch (err) {
    if (err instanceof StitchDailyQuotaExceededError) {
      return NextResponse.json(
        {
          error: err.message,
          code: err.code,
          limit: err.limit,
          used: err.used,
        },
        { status: stitchDailyQuotaToHttpStatus() },
      );
    }
    if (err instanceof StitchConfigError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    if (err instanceof StitchError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: stitchErrorToHttpStatus(err) },
      );
    }
    console.error("[stitch] POST /api/test failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
