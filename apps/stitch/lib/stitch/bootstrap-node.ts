import { getOrCreateLaunchRosettaProject } from "./launch-rosetta";
import { hasStitchCredentials, loadStitchAppEnv } from "./load-env";

/**
 * Ensures the Launch Rosetta Stitch project exists. Safe to call from
 * instrumentation and from API routes. Logs and swallows errors so a missing
 * API key does not prevent the dev server from starting.
 */
export async function ensureLaunchRosettaProject(): Promise<void> {
  loadStitchAppEnv();
  if (!hasStitchCredentials()) {
    console.warn(
      "[stitch] STITCH_API_KEY is not set. Add it to apps/stitch/.env.local or apps/stitch/app/.env. See docs/README.md.",
    );
    return;
  }

  try {
    const project = await getOrCreateLaunchRosettaProject();
    console.info(
      `[stitch] Launch Rosetta project ready (projectId=${project.projectId})`,
    );
  } catch (err) {
    console.error("[stitch] Failed to ensure Launch Rosetta project:", err);
  }
}
