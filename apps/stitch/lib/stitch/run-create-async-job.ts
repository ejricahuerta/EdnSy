import { StitchError } from "@google/stitch-sdk";
import { buildLandingPagePrompt } from "@/lib/prompts/landing-page";
import {
  stripAsyncDemoMeta,
  websiteTemplatePayloadToLandingPageContext,
} from "@/lib/map-website-template-to-landing-context";
import {
  StitchDailyQuotaExceededError,
  withDailyGenerationQuota,
} from "@/lib/stitch/daily-generation-quota";
import { generateScreenHtml } from "@/lib/stitch/generate-screen-html";
import { getOrCreateLaunchRosettaProject } from "@/lib/stitch/launch-rosetta";
import { StitchConfigError } from "@/lib/stitch/load-env";
import { uploadDemoHtmlToStorage } from "@/lib/stitch/upload-demo-html";

export type CreateAsyncMeta = {
  jobId: string;
  prospectId: string;
  userId?: string;
  callbackUrl: string;
  callbackToken: string;
};

export async function postCallback(
  callbackUrl: string,
  callbackToken: string,
  body: Record<string, unknown>,
): Promise<void> {
  const res = await fetch(callbackUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${callbackToken}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(
      "[stitch] create-async callback failed",
      callbackUrl,
      res.status,
      text.slice(0, 200),
    );
  }
}

function errorMessage(err: unknown): string {
  if (err instanceof StitchDailyQuotaExceededError) return err.message;
  if (err instanceof StitchConfigError) return err.message;
  if (err instanceof StitchError) return err.message;
  if (err instanceof Error) return err.message;
  return String(err);
}

/**
 * Full pipeline: Stitch generate → optional Supabase upload (best-effort) →
 * success callback **with `html`** so admin `generation-callback` always runs `uploadDemoHtml`
 * (same as website-template). Stitch upload is optional redundancy when env is set.
 * On failure before HTML exists, POST callback with `{ error }`.
 */
export async function runCreateAsyncJob(
  meta: CreateAsyncMeta,
  rawPayload: Record<string, unknown>,
): Promise<void> {
  const { jobId, prospectId, userId, callbackUrl, callbackToken } = meta;

  const sendError = async (err: unknown) => {
    await postCallback(callbackUrl, callbackToken, {
      jobId,
      prospectId,
      ...(userId !== undefined ? { userId } : {}),
      error: errorMessage(err),
    });
  };

  try {
    const stripped = stripAsyncDemoMeta(rawPayload);
    const context = websiteTemplatePayloadToLandingPageContext(stripped);
    const prompt = buildLandingPagePrompt(context);
    const project = await getOrCreateLaunchRosettaProject();
    const result = await withDailyGenerationQuota(() =>
      generateScreenHtml(project, prompt),
    );

    let html = result.html;
    if (html === undefined || html.trim().length === 0) {
      try {
        const res = await fetch(result.htmlUrl);
        if (res.ok) html = await res.text();
      } catch {
        // handled below
      }
    }

    if (html === undefined || html.trim().length === 0) {
      await sendError(
        new Error("Stitch did not return downloadable HTML for this screen."),
      );
      return;
    }

    const trimmed = html.trim();
    const upload = await uploadDemoHtmlToStorage(prospectId, trimmed);
    if (!upload.ok) {
      console.warn(
        "[stitch] create-async: optional Supabase upload failed (admin will persist via callback):",
        upload.error,
      );
    }

    await postCallback(callbackUrl, callbackToken, {
      jobId,
      prospectId,
      ...(userId !== undefined ? { userId } : {}),
      html: trimmed,
    });
  } catch (err) {
    await sendError(err);
  }
}
