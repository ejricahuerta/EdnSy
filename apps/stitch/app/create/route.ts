import { StitchError } from "@google/stitch-sdk";
import { NextResponse } from "next/server";
import {
  buildLandingPagePrompt,
  type LandingPageContext,
} from "@/lib/prompts/landing-page";
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

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { error: "Body must be a JSON object" },
      { status: 400 },
    );
  }

  try {
    const project = await getOrCreateLaunchRosettaProject();
    const prompt = buildLandingPagePrompt(body as LandingPageContext);
    const result = await withDailyGenerationQuota(() =>
      generateScreenHtml(project, prompt),
    );
    return NextResponse.json(result);
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
    console.error("[stitch] POST /create failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
