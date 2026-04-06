import { after } from "next/server";
import { NextResponse } from "next/server";
import { isCallbackUrlAllowed } from "@/lib/stitch/callback-url";
import { runCreateAsyncJob } from "@/lib/stitch/run-create-async-job";

function getExpectedApiKey(): string {
  return (
    process.env.DEMO_GENERATOR_API_KEY ??
    process.env.STITCH_DEMO_GENERATOR_API_KEY ??
    ""
  ).trim();
}

function validateBearer(request: Request): boolean {
  const expected = getExpectedApiKey();
  if (!expected) return true;
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  return token === expected;
}

/** Shared handler for POST /api/create-async and POST /api/dental-async (alias). */
export async function createAsyncPost(request: Request): Promise<Response> {
  if (!validateBearer(request)) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        message:
          "Missing or invalid Authorization header. Use Bearer <DEMO_GENERATOR_API_KEY>.",
      },
      { status: 401 },
    );
  }

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

  const payload = body as Record<string, unknown>;
  const jobId = payload.jobId;
  const prospectId = payload.prospectId;
  const callbackUrl = payload.callbackUrl;
  const callbackToken = payload.callbackToken;
  const userId = payload.userId;

  if (
    typeof jobId !== "string" ||
    !jobId.trim() ||
    typeof prospectId !== "string" ||
    !prospectId.trim() ||
    typeof callbackUrl !== "string" ||
    !callbackUrl.trim() ||
    typeof callbackToken !== "string" ||
    !callbackToken.trim()
  ) {
    return NextResponse.json(
      {
        error: "Invalid body",
        message:
          "jobId, prospectId, callbackUrl, and callbackToken are required strings.",
      },
      { status: 400 },
    );
  }

  if (!isCallbackUrlAllowed(callbackUrl)) {
    return NextResponse.json(
      {
        error: "Invalid callback URL",
        message:
          "callbackUrl must be HTTPS (or HTTP for localhost). If ALLOWED_CALLBACK_ORIGINS is set, origin must be in that list.",
      },
      { status: 400 },
    );
  }

  const meta = {
    jobId: jobId.trim(),
    prospectId: prospectId.trim(),
    callbackUrl: callbackUrl.trim(),
    callbackToken: callbackToken.trim(),
    ...(typeof userId === "string" && userId.trim()
      ? { userId: userId.trim() }
      : {}),
  };

  after(async () => {
    await runCreateAsyncJob(meta, payload);
  });

  return NextResponse.json(
    { id: meta.jobId, status: "accepted" },
    { status: 202 },
  );
}
