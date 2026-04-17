import { loadEnvConfig } from "@next/env";
import path from "path";

let didLoad = false;

/**
 * Loads `.env`, `.env.local`, and mode-specific files from the Next app root
 * (`process.cwd()`, expected to be `apps/stitch` when you run `pnpm dev` there).
 * Instrumentation runs before the full Next server env pipeline; calling this
 * ensures `STITCH_API_KEY` from `.env.local` is visible to the Stitch SDK.
 */
export function loadStitchAppEnv(): void {
  if (didLoad) return;
  didLoad = true;
  const root = path.resolve(process.cwd());
  const dev = process.env.NODE_ENV !== "production";
  // Load app/.env first so root `.env.local` still overrides (matches typical Next precedence).
  loadEnvConfig(path.join(root, "app"), dev);
  loadEnvConfig(root, dev);
}

export function hasStitchCredentials(): boolean {
  return Boolean(process.env.STITCH_API_KEY?.trim());
}

export class StitchConfigError extends Error {
  constructor() {
    super(
      "Stitch is not configured: set STITCH_API_KEY (Google Stitch API key only; OAuth is not used) in apps/stitch/.env.local or apps/stitch/app/.env.",
    );
    this.name = "StitchConfigError";
  }
}

export function assertStitchCredentials(): void {
  loadStitchAppEnv();
  if (!hasStitchCredentials()) {
    throw new StitchConfigError();
  }
}
