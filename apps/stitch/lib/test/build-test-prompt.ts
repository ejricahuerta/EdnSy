import { readFileSync } from "fs";
import { join } from "path";

export function buildTestPromptFromPayload(payload: unknown): string {
  const oneLinerPath = join(
    process.cwd(),
    "docs",
    "references",
    "landing-page-prompt-one-liner.txt",
  );
  const oneLiner = readFileSync(oneLinerPath, "utf8").trim();
  return `${oneLiner}\n\n${JSON.stringify(payload, null, 2)}`;
}
