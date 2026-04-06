import { stitch, type Project } from "@google/stitch-sdk";
import { assertStitchCredentials } from "./load-env";

export const LAUNCH_ROSETTA_PROJECT_TITLE = "Launch Rosetta";

function matchesLaunchRosetta(project: Project): boolean {
  const d = project.data;
  if (!d || typeof d !== "object") return false;
  const title =
    "title" in d && typeof d.title === "string" ? d.title : undefined;
  const name =
    "name" in d && typeof d.name === "string" ? d.name : undefined;
  return (
    title === LAUNCH_ROSETTA_PROJECT_TITLE ||
    name === LAUNCH_ROSETTA_PROJECT_TITLE
  );
}

/**
 * Returns the Stitch project used for landing-page generation.
 * Prefer STITCH_LAUNCH_ROSETTA_PROJECT_ID when set (bare numeric id).
 */
export async function getOrCreateLaunchRosettaProject(): Promise<Project> {
  assertStitchCredentials();

  const envId = process.env.STITCH_LAUNCH_ROSETTA_PROJECT_ID?.trim();
  if (envId) {
    return stitch.project(envId);
  }

  const projects = await stitch.projects();
  const existing = projects.find(matchesLaunchRosetta);
  if (existing) {
    return existing;
  }

  return stitch.createProject(LAUNCH_ROSETTA_PROJECT_TITLE);
}
