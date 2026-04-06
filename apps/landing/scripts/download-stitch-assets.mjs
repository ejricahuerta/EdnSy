/**
 * Download Stitch screen HTML and screenshots from URLs in docs/stitch/.../stitch-urls.json
 * (copy from stitch-urls.example.json). Uses redirect-following fetch (curl -L equivalent).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const landingRoot = path.join(__dirname, "..");
const urlsPath = path.join(
  landingRoot,
  "docs/stitch/smb-platform-redesign/stitch-urls.json",
);
const screenDirs = {
  "ed-sy-home": path.join(
    landingRoot,
    "docs/stitch/smb-platform-redesign/screens/ed-sy-home",
  ),
  "ednsy-home": path.join(
    landingRoot,
    "docs/stitch/smb-platform-redesign/screens/ednsy-home",
  ),
};

async function downloadToFile(url, destPath) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url.slice(0, 80)}…`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, buf);
  console.log(`Wrote ${buf.length} bytes → ${path.relative(landingRoot, destPath)}`);
}

async function main() {
  if (!fs.existsSync(urlsPath)) {
    console.log(
      `No ${path.relative(landingRoot, urlsPath)} — copy stitch-urls.example.json, add URLs from Stitch get_screen, then re-run.`,
    );
    process.exit(0);
  }

  const raw = JSON.parse(fs.readFileSync(urlsPath, "utf8"));
  const screens = raw.screens ?? {};
  let count = 0;

  for (const [key, dir] of Object.entries(screenDirs)) {
    const cfg = screens[key];
    if (!cfg) continue;

    if (cfg.htmlDownloadUrl?.trim()) {
      await downloadToFile(cfg.htmlDownloadUrl.trim(), path.join(dir, "screen.html"));
      count++;
    }
    if (cfg.screenshotDownloadUrl?.trim()) {
      const screenshotPath = path.join(dir, "screenshot.png");
      await downloadToFile(cfg.screenshotDownloadUrl.trim(), screenshotPath);
      count++;
    }
  }

  if (count === 0) {
    console.log("stitch-urls.json has no htmlDownloadUrl / screenshotDownloadUrl entries filled.");
    process.exit(0);
  }
  console.log(`Done (${count} file(s)).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
