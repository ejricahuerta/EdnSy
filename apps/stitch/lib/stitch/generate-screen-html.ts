import { StitchError, type Project } from "@google/stitch-sdk";

/** Gemini model for `generate_screen_from_text` (see `@google/stitch-sdk` Project.generate). */
export const STITCH_SCREEN_MODEL_ID = "GEMINI_3_1_PRO" as const;

export function stitchErrorToHttpStatus(err: StitchError): number {
  switch (err.code) {
    case "AUTH_FAILED":
      return 401;
    case "PERMISSION_DENIED":
      return 403;
    case "NOT_FOUND":
      return 404;
    case "RATE_LIMITED":
      return 429;
    case "VALIDATION_ERROR":
      return 400;
    case "NETWORK_ERROR":
      return 503;
    default:
      return 500;
  }
}

export type GenerateScreenHtmlResult = {
  projectId: string;
  screenId: string;
  htmlUrl: string;
  html?: string;
};

export async function generateScreenHtml(
  project: Project,
  prompt: string,
): Promise<GenerateScreenHtmlResult> {
  const screen = await project.generate(
    prompt,
    "DESKTOP",
    STITCH_SCREEN_MODEL_ID,
  );
  const htmlUrl = await screen.getHtml();

  let html: string | undefined;
  try {
    const res = await fetch(htmlUrl);
    if (res.ok) {
      html = await res.text();
    }
  } catch {
    // Omit html if download fails; htmlUrl remains valid for clients.
  }

  return {
    projectId: project.projectId,
    screenId: screen.screenId,
    htmlUrl,
    ...(html !== undefined ? { html } : {}),
  };
}
