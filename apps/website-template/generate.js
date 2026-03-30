#!/usr/bin/env node
/**
 * Website Template Agent
 *
 * Three-phase flow:
 * 1. BRANDING: Load branding-prompt.md + index.json → call Claude → get structured branding spec (voice, colors, typography, CTAs).
 * 2. PLANNING: Load plan-prompt.md + index.json + branding → call Claude → get structured plan (design, sections, typography, etc.).
 * 3. GENERATE: Load prompt.md + plan + branding + index.json → call Claude (streaming) → full page HTML.
 * 4. Write index.html (or --out), output/{id}.html, optional plan to --plan-out, optional branding to --branding-out, and Supabase Storage.
 *
 * Usage:
 *   npm run generate
 *   node generate.js --json=../index.json --out=../index.html
 *   node generate.js --plan-out=../plan.md
 *
 * Requires CLAUDE_API_KEY (or ANTHROPIC_API_KEY) in env or .env (or keys.json Claude.apiKey).
 * Set DEBUG=1 or DEBUG=website-template for debug logging.
 */

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { readFile, writeFile, mkdir } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { obfuscateHtml } from "./renderer/obfuscate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env from agent folder or parent (website-template)
config({ path: resolve(__dirname, ".env") });
config({ path: resolve(__dirname, "../.env") });

const DEFAULT_PROMPT_PATH = resolve(__dirname, "prompts/prompt.md");
const DEFAULT_PLAN_PROMPT_PATH = resolve(__dirname, "prompts/plan-prompt.md");
const DEFAULT_BRANDING_PROMPT_PATH = resolve(__dirname, "prompts/branding-prompt.md");
const DEFAULT_JSON_PATH = resolve(__dirname, "index.json");
const DEFAULT_OUT_PATH = resolve(__dirname, "index.html");

const CLAUDE_MODEL = "claude-sonnet-4-20250514";
const CLAUDE_MAX_TOKENS = 64000;
const CLAUDE_PLAN_MAX_TOKENS = 8192;
const CLAUDE_BRANDING_MAX_TOKENS = 4096;
const SUPABASE_STORAGE_BUCKET = "admin-ednsy-bucket";
const SUPABASE_STORAGE_PREFIX = "demo-html";
const DEMOS_DIR = resolve(__dirname, "demos");
const OUTPUT_DIR = resolve(__dirname, "output");

const DEBUG = /^(1|true|yes|website-template)$/i.test((process.env.DEBUG ?? "").trim());
function debug(...args) {
  if (DEBUG) console.log("[website-template]", ...args);
}

function parseArgs() {
  const args = process.argv.slice(2);
  let jsonPath = DEFAULT_JSON_PATH;
  let outPath = DEFAULT_OUT_PATH;
  let promptPath = DEFAULT_PROMPT_PATH;
  let planPromptPath = DEFAULT_PLAN_PROMPT_PATH;
  let brandingPromptPath = DEFAULT_BRANDING_PROMPT_PATH;
  let planOutPath = null;
  let brandingOutPath = null;

  for (const arg of args) {
    if (arg.startsWith("--json=")) jsonPath = resolve(process.cwd(), arg.slice(7));
    else if (arg.startsWith("--out=")) outPath = resolve(process.cwd(), arg.slice(6));
    else if (arg.startsWith("--prompt=")) promptPath = resolve(process.cwd(), arg.slice(9));
    else if (arg.startsWith("--plan-prompt=")) planPromptPath = resolve(process.cwd(), arg.slice(14));
    else if (arg.startsWith("--plan-out=")) planOutPath = resolve(process.cwd(), arg.slice(11));
    else if (arg.startsWith("--branding-prompt=")) brandingPromptPath = resolve(process.cwd(), arg.slice(18));
    else if (arg.startsWith("--branding-out=")) brandingOutPath = resolve(process.cwd(), arg.slice(15));
  }

  return { promptPath, planPromptPath, brandingPromptPath, planOutPath, brandingOutPath, jsonPath, outPath };
}

/**
 * Get Claude API key from env or keys.json (Claude.apiKey or Anthropic.apiKey).
 */
async function getClaudeApiKey() {
  const key = (process.env.CLAUDE_API_KEY ?? process.env.ANTHROPIC_API_KEY)?.trim();
  if (key) return key;
  try {
    const keysPath = resolve(__dirname, "../../keys.json");
    const keys = JSON.parse(await readFile(keysPath, "utf-8"));
    const fromClaude = keys?.Claude?.apiKey?.trim();
    if (fromClaude) return fromClaude;
    const fromAnthropic = keys?.Anthropic?.apiKey?.trim();
    if (fromAnthropic) return fromAnthropic;
  } catch (_) {}
  throw new Error("Missing CLAUDE_API_KEY (or ANTHROPIC_API_KEY). Set it in your environment or .env.");
}

/**
 * Get Supabase client config from env or from keys.json (Supabase.rosetta).
 */
async function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (url && key) return { url, key };
  try {
    const keysPath = resolve(__dirname, "../../keys.json");
    const keys = JSON.parse(await readFile(keysPath, "utf-8"));
    const rosetta = keys?.Supabase?.rosetta;
    if (rosetta?.url && rosetta?.serviceRoleKey) return { url: rosetta.url, key: rosetta.serviceRoleKey };
    if (rosetta?.url && rosetta?.anonKey) return { url: rosetta.url, key: rosetta.anonKey };
  } catch (_) {}
  return null;
}

/**
 * Upload HTML to Supabase Storage: admin-ednsy-bucket / demo-html/{id}.html
 * Uses data.id from JSON when present, otherwise generates a new UUID.
 */
async function uploadToSupabase(html, idFromData) {
  const config = await getSupabaseConfig();
  if (!config) {
    debug("Supabase not configured, skipping upload");
    console.warn("Supabase not configured (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY or keys.json). Skipping upload.");
    return null;
  }
  const id = (idFromData && String(idFromData).trim()) || randomUUID();
  const fileName = `${id}.html`;
  const storagePath = `${SUPABASE_STORAGE_PREFIX}/${fileName}`;
  debug("uploadToSupabase: starting", { id, storagePath, htmlLength: html?.length });
  const supabase = createClient(config.url, config.key);
  const { data, error } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .upload(storagePath, html, { contentType: "text/html", upsert: true });
  if (error) {
    debug("uploadToSupabase: failed", error.message);
    console.error("Supabase storage upload failed:", error.message);
    return null;
  }
  const { data: urlData } = supabase.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(storagePath);
  debug("uploadToSupabase: done", { storagePath, publicUrl: urlData?.publicUrl });
  console.log("Uploaded to Supabase:", storagePath, "| Public URL:", urlData?.publicUrl ?? "(check bucket policy)");
  return { id, path: storagePath, publicUrl: urlData?.publicUrl };
}

/**
 * Extract raw HTML from model response (handles markdown code blocks).
 */
function extractHtml(text) {
  if (!text || typeof text !== "string") return "";
  const trimmed = text.trim();
  const htmlBlock = /```(?:html)?\s*([\s\S]*?)```/i.exec(trimmed);
  if (htmlBlock) return htmlBlock[1].trim();
  if (trimmed.startsWith("<") || trimmed.startsWith("<!DOCTYPE")) return trimmed;
  return trimmed;
}

async function loadPrompt(promptPath) {
  const content = await readFile(promptPath, "utf-8");
  return content;
}

async function loadJson(jsonPath) {
  const content = await readFile(jsonPath, "utf-8");
  return JSON.parse(content);
}

/**
 * Phase 0: Get a structured branding spec from Claude (voice, colors, typography, CTAs) from business data.
 * Returns the branding text to inject into planning and generate phases.
 */
async function runBrandingPhase(client, brandingPromptText, data) {
  debug("runBrandingPhase: starting");
  const userMessage = `${brandingPromptText}\n\n---\n\nThe business data for this branding is below. Output only the structured branding spec in the requested format — no preamble, no code.\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: CLAUDE_BRANDING_MAX_TOKENS,
    temperature: 0.3,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = response.content?.find((block) => block.type === "text")?.text?.trim?.();
  if (!text) {
    debug("runBrandingPhase: no text in response");
    throw new Error("Branding phase returned no text.");
  }
  debug("runBrandingPhase: done", { textLength: text.length });
  return text;
}

/**
 * Phase 1: Get a structured plan from Claude (design, sections, typography, image strategy).
 * Uses branding when provided so the plan aligns with the brand spec.
 * Returns the plan text to inject into the generate phase.
 */
async function runPlanningPhase(client, planPromptText, data, branding) {
  debug("runPlanningPhase: starting", { hasBranding: !!branding });
  const brandingBlock = branding
    ? `\n\n## APPROVED BRANDING (follow this)\n\n${branding}\n\n---\n\n`
    : "";
  const userMessage = `${planPromptText}${brandingBlock}The business data for this plan is below. Output only the structured plan in the requested format — no preamble, no code.\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: CLAUDE_PLAN_MAX_TOKENS,
    temperature: 0.3,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = response.content?.find((block) => block.type === "text")?.text?.trim?.();
  if (!text) {
    debug("runPlanningPhase: no text in response");
    throw new Error("Planning phase returned no text.");
  }
  debug("runPlanningPhase: done", { textLength: text.length });
  return text;
}

/**
 * Core generation: run branding → plan → generate with in-memory data.
 * @param {object} data - Business data (index.json shape).
 * @param {object} [options] - Optional overrides.
 * @param {string} [options.apiKey] - Claude API key (default: from getClaudeApiKey()).
 * @param {string} [options.promptPath] - Build prompt path.
 * @param {string} [options.planPromptPath] - Plan prompt path.
 * @param {string} [options.brandingPromptPath] - Branding prompt path.
 * @param {boolean} [options.upload=true] - Whether to upload HTML to Supabase.
 * @returns {Promise<{ html: string, branding: string, plan: string, id: string, publicUrl?: string }>}
 */
export async function generate(data, options = {}) {
  debug("generate: start", { dataId: data?.id, upload: options.upload !== false });
  const promptPath = options.promptPath ?? DEFAULT_PROMPT_PATH;
  const planPromptPath = options.planPromptPath ?? DEFAULT_PLAN_PROMPT_PATH;
  const brandingPromptPath = options.brandingPromptPath ?? DEFAULT_BRANDING_PROMPT_PATH;
  const doUpload = options.upload !== false;

  const apiKey = options.apiKey ?? (await getClaudeApiKey());
  debug("generate: API key resolved, creating client");
  const client = new Anthropic({ apiKey });

  const [promptText, planPromptText, brandingPromptText] = await Promise.all([
    readFile(promptPath, "utf-8"),
    readFile(planPromptPath, "utf-8").catch(() => null),
    readFile(brandingPromptPath, "utf-8").catch(() => null),
  ]);

  let branding = "";
  if (brandingPromptText) {
    branding = await runBrandingPhase(client, brandingPromptText, data);
  } else {
    debug("generate: no branding prompt, skipping branding phase");
  }

  let plan = "";
  if (planPromptText) {
    plan = await runPlanningPhase(client, planPromptText, data, branding);
  } else {
    debug("generate: no plan prompt, skipping planning phase");
  }

  const approvedBrandingBlock = branding
    ? `\n\n## APPROVED BRANDING FOR THIS RUN\n\nFollow this branding exactly (voice, colors, typography, CTAs).\n\n${branding}\n\n---\n\n`
    : "";
  const approvedPlanBlock = plan
    ? `\n\n## APPROVED PLAN FOR THIS RUN\n\nFollow this plan exactly. Do not deviate from the section order, typography, or visual identity specified.\n\n${plan}\n\n---\n\n`
    : "\n\n";

  const userMessage = `${promptText}${approvedBrandingBlock}${approvedPlanBlock}Use the instructions above${plan ? " and the approved plan" : ""}${branding ? " and the approved branding" : ""}. The business data for this run is in the following JSON. Produce only the single \`index.html\` file as specified — no explanation, just the code.\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;

  debug("generate: streaming HTML phase");
  const stream = client.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: CLAUDE_MAX_TOKENS,
    temperature: 0.4,
    messages: [{ role: "user", content: userMessage }],
  });

  const raw = await stream.finalText();
  if (!raw) {
    debug("generate: stream returned no text");
    throw new Error("Generate phase returned no text.");
  }

  let html = extractHtml(raw);
  html = obfuscateHtml(html);
  debug("generate: HTML extracted", { rawLength: raw.length, htmlLength: html.length });
  const id = (data?.id && String(data.id).trim()) || randomUUID();

  let publicUrl;
  if (doUpload) {
    const upload = await uploadToSupabase(html, id);
    if (upload) publicUrl = upload.publicUrl;
  }

  debug("generate: complete", { id, hasPublicUrl: !!publicUrl });
  return { html, branding, plan, id, publicUrl };
}

async function main() {
  const { promptPath, planPromptPath, brandingPromptPath, planOutPath, brandingOutPath, jsonPath, outPath } =
    parseArgs();

  console.log("Website Template Agent (branding → plan → generate)");
  console.log("  Branding prompt:", brandingPromptPath);
  console.log("  Plan prompt:   ", planPromptPath);
  console.log("  Build prompt: ", promptPath);
  console.log("  Data:         ", jsonPath);
  console.log("  Output:       ", outPath);
  if (brandingOutPath) console.log("  Branding out: ", brandingOutPath);
  if (planOutPath) console.log("  Plan out:     ", planOutPath);

  const data = await loadJson(jsonPath);
  const result = await generate(data, {
    promptPath,
    planPromptPath,
    brandingPromptPath,
    upload: true,
  });

  await writeFile(outPath, result.html, "utf-8");
  console.log("Wrote", outPath);

  await mkdir(OUTPUT_DIR, { recursive: true });
  const outputPath = resolve(OUTPUT_DIR, `${result.id}.html`);
  await writeFile(outputPath, result.html, "utf-8");
  console.log("Wrote", outputPath);

  if (planOutPath && result.plan) {
    await mkdir(dirname(planOutPath), { recursive: true }).catch(() => {});
    await writeFile(planOutPath, result.plan, "utf-8");
    console.log("Wrote plan:", planOutPath);
  }
  if (brandingOutPath && result.branding) {
    await mkdir(dirname(brandingOutPath), { recursive: true }).catch(() => {});
    await writeFile(brandingOutPath, result.branding, "utf-8");
    console.log("Wrote branding:", brandingOutPath);
  }
  if (result.publicUrl) console.log("File id:", result.id, "| Public URL:", result.publicUrl);
}

// Only run CLI when this file is the entry point (e.g. npm run generate), not when imported by server.js
const isMainModule =
  process.argv[1] && resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1]);
if (isMainModule) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

