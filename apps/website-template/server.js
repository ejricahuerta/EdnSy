#!/usr/bin/env node
/**
 * Website Template Agent — HTTP API
 *
 * POST /api/generate      — body: business data (JSON); returns { id, publicUrl?, plan?, branding? } (no html). Requires API key.
 * POST /api/generate-async — body: business data + jobId, prospectId, userId?, callbackUrl, callbackToken; returns 202; runs generate in background and POSTs result to callbackUrl. Requires API key.
 * POST /api/dental        — body: dental JSON (index.json shape); HTML from a random dental style guide (dental-v1..v6). Optional: styleId or dentalStyleId, leadRosettaLayout. Requires API key.
 * POST /api/dental-async  — same render rules as /api/dental + callback meta; 202 + callback with html. Requires API key.
 * GET  /api/health       — 200 OK (readiness)
 * GET  /api-docs         — Swagger UI (OpenAPI 3)
 *
 * Usage: node server.js [--port=3000]
 * Requires CLAUDE_API_KEY (or ANTHROPIC_API_KEY) and optional Supabase env for upload. Set DEMO_GENERATOR_API_KEY (or WEBSITE_TEMPLATE_API_KEY) to secure POST endpoints.
 * Set DEBUG=1 or DEBUG=website-template for debug logging.
 */

import express from "express";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import { generate } from "./generate.js";
import { renderPage, isValidDentalStyle } from "./renderer/index.js";
import { obfuscateHtml } from "./renderer/obfuscate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const openApiSpec = JSON.parse(
  readFileSync(resolve(__dirname, "openapi.json"), "utf-8")
);
const DISABLE_API_DOCS = /^(1|true|yes)$/i.test((process.env.DISABLE_API_DOCS ?? "").trim());
const BASE_URL = (process.env.BASE_URL ?? "").trim();
if (BASE_URL && openApiSpec.servers?.length) {
  openApiSpec.servers = [{ url: BASE_URL.replace(/\/$/, ""), description: "API" }, ...openApiSpec.servers];
}

const DEBUG = /^(1|true|yes|website-template|pitch-rosetta)$/i.test((process.env.DEBUG ?? "").trim());

function debug(...args) {
  if (DEBUG) console.log("[website-template]", ...args);
}

/** Server logs: always-on request/event logging with [website-template] prefix and optional timestamp */
function log(level, ...args) {
  const ts = new Date().toISOString();
  const prefix = `[website-template] ${ts}`;
  if (level === "error") console.error(prefix, ...args);
  else if (level === "warn") console.warn(prefix, ...args);
  else console.log(prefix, ...args);
}

const PORT = parseInt(process.env.PORT ?? "3000", 10);
const MAX_BODY_SIZE = "1mb";

const API_KEY = (process.env.DEMO_GENERATOR_API_KEY ?? process.env.WEBSITE_TEMPLATE_API_KEY ?? process.env.PITCH_ROSETTA_API_KEY ?? "").trim();
const ALLOWED_CALLBACK_ORIGINS = (process.env.ALLOWED_CALLBACK_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

function requireApiKey(req, res, next) {
  if (!API_KEY) {
    debug("API key not set, allowing request");
    return next(); // no key set: allow (e.g. local dev)
  }
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (token !== API_KEY) {
    log("warn", "Unauthorized:", req.method, req.path, "missing or invalid Bearer token");
    return res.status(401).json({
      error: "Unauthorized",
      message: "Missing or invalid Authorization header. Use Bearer <API_KEY>.",
    });
  }
  debug("API key validated");
  next();
}

function isLoopback(hostname) {
  if (!hostname) return false;
  const h = hostname.toLowerCase();
  return h === "localhost" || h === "127.0.0.1" || h === "[::1]";
}

function isCallbackUrlAllowed(url) {
  if (!url || typeof url !== "string") return false;
  try {
    const u = new URL(url);
    const isHttps = u.protocol === "https:";
    const isHttpLoopback = u.protocol === "http:" && isLoopback(u.hostname);
    if (!isHttps && !isHttpLoopback) return false;
    if (ALLOWED_CALLBACK_ORIGINS.length === 0) return true;
    const origin = u.origin.toLowerCase();
    return ALLOWED_CALLBACK_ORIGINS.some((allowed) => origin === allowed.toLowerCase());
  } catch {
    return false;
  }
}

/** Strip meta and render-control fields so templates only receive business/content data. */
function stripMetaForGenerate(payload) {
  const {
    callbackUrl,
    callbackToken,
    jobId,
    prospectId,
    userId,
    styleId,
    dentalStyleId,
    leadRosettaLayout,
    ...rest
  } = payload;
  return rest;
}

/** Optional render hints on the JSON body (not passed to section renderers). */
function getRenderOptionsFromPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return {};
  }
  const raw =
    (typeof payload.styleId === "string" && payload.styleId.trim()) ||
    (typeof payload.dentalStyleId === "string" && payload.dentalStyleId.trim()) ||
    "";
  const styleId = raw && isValidDentalStyle(raw) ? raw : undefined;
  const leadRosettaLayout = payload.leadRosettaLayout === true;
  return { styleId, leadRosettaLayout };
}

async function postCallback(callbackUrl, callbackToken, body) {
  debug("postCallback", { callbackUrl, hasToken: !!callbackToken, bodyKeys: Object.keys(body ?? {}) });
  try {
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
      debug("callback failed", callbackUrl, res.status, text.slice(0, 200));
      log("error", "callback failed", callbackUrl, res.status, text.slice(0, 200));
    } else {
      log("info", "callback ok", callbackUrl, res.status);
      debug("callback succeeded", callbackUrl, res.status);
    }
  } catch (err) {
    const msg = err?.message ?? err;
    debug("callback error", callbackUrl, msg);
    log("error", "callback error", callbackUrl, msg);
  }
}

const app = express();

/** Static images for dental styles (v3, v4, v5) — GET /images/dental/hero.jpg, /images/dental/about.jpg */
app.use("/images", express.static(resolve(__dirname, "images")));

/** Static images used by dental style-guide HTML (dental-v6.html, etc.) */
app.use(
  "/style-guides/dental/images",
  express.static(resolve(__dirname, "style-guides", "dental", "images"))
);

/** API docs (OpenAPI 3 + Swagger UI). Set DISABLE_API_DOCS=1 to hide in production. */
if (!DISABLE_API_DOCS) {
  app.get("/api/openapi.json", (req, res) => {
    res.set("Cache-Control", "no-store").json(openApiSpec);
  });
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec, { explorer: true }));
}
app.use(express.json({ limit: MAX_BODY_SIZE }));
app.use((req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    log("info", req.method, req.path, res.statusCode, `${duration}ms`);
    if (DEBUG) debug("request", req.method, req.path, res.statusCode, `${duration}ms`);
  });
  next();
});

/** GET /api/health — readiness */
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "website-template-agent" });
});

/** Dental JSON candidates for render-test (relative to server dir). Only these filenames are allowed for ?json= */
const DENTAL_JSON_CANDIDATES = [
  "index.json",
  "index-dental-riverside.json",
  "index-dental-downtown.json",
];

/** Load dental JSON by filename (must be in DENTAL_JSON_CANDIDATES) or pick random from existing. Returns { data, file } or null. */
function loadIndexJson(jsonParam) {
  const dir = __dirname;
  const existing = DENTAL_JSON_CANDIDATES.filter((name) => existsSync(resolve(dir, name)));
  if (existing.length === 0) return null;
  const requested = (jsonParam ?? "").trim();
  const chosen =
    requested && DENTAL_JSON_CANDIDATES.includes(requested) && existsSync(resolve(dir, requested))
      ? requested
      : existing[Math.floor(Math.random() * existing.length)];
  try {
    const data = JSON.parse(readFileSync(resolve(dir, chosen), "utf-8"));
    return { data, file: chosen };
  } catch {
    return null;
  }
}

/** GET /api/render-test — render HTML. Mix/match JSON and style via query.
 *  ?json=index.json|index-dental-riverside.json|index-dental-downtown.json (optional; omit for random JSON)
 *  ?style=dental-v1|dental-v2|dental-v3|dental-v4|dental-v6 (optional; omit for random dental style guide)
 *  ?layout=admin — use Ed & Sy Admin single layout instead of style guides (only when ?style is omitted)
 */
app.get("/api/render-test", (req, res) => {
  const loaded = loadIndexJson(req.query.json);
  if (!loaded || typeof loaded.data !== "object") {
    log("warn", "GET /api/render-test 503 — no dental JSON found");
    res.status(503).set("Content-Type", "application/json").json({
      error: "No dental JSON found for test",
      message: "Add at least one of index.json, index-dental-riverside.json, index-dental-downtown.json to the website-template root and restart.",
    });
    return;
  }
  const styleParam = (req.query.style ?? "").trim();
  const styleId = styleParam && isValidDentalStyle(styleParam) ? styleParam : undefined;
  const requestedLayout = (req.query.layout ?? "").trim().toLowerCase();
  const leadRosettaLayout =
    !styleId && (requestedLayout === "lead-rosetta" || requestedLayout === "admin");
  let html = renderPage(loaded.data, { styleId, leadRosettaLayout });
  html = obfuscateHtml(html);
  res.set({ "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
  res.send(html);
});

/** POST /api/dental — body: dental business data (index.json shape); returns rendered HTML (style randomized). Requires API key. */
app.post("/api/dental", requireApiKey, (req, res) => {
  debug("POST /api/dental", { bodyKeys: req.body ? Object.keys(req.body) : [] });
  const data = req.body;
  if (!data || typeof data !== "object") {
    log("warn", "POST /api/dental invalid body");
    return res.status(400).json({
      error: "Invalid body",
      message: "Request body must be a JSON object (dental business data, e.g. index.json shape).",
    });
  }
  try {
    const renderOpts = getRenderOptionsFromPayload(data);
    const dataClean = stripMetaForGenerate(data);
    let html = renderPage(dataClean, renderOpts);
    html = obfuscateHtml(html);
    res.set({ "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    res.send(html);
    log("info", "POST /api/dental 200", "html length", html?.length ?? 0);
  } catch (err) {
    const message = err?.message ?? String(err);
    log("error", "POST /api/dental render failed", message);
    res.status(500).json({
      error: "Render failed",
      message,
    });
  }
});

/** POST /api/dental-async — body: dental data + jobId, prospectId, userId?, callbackUrl, callbackToken. Returns 202; renders in background and POSTs { jobId, prospectId, userId?, html } or { ..., error } to callbackUrl. */
app.post("/api/dental-async", requireApiKey, (req, res) => {
  debug("POST /api/dental-async", { bodyKeys: req.body ? Object.keys(req.body) : [] });
  const payload = req.body;
  if (!payload || typeof payload !== "object") {
    debug("dental-async: invalid body");
    return res.status(400).json({
      error: "Invalid body",
      message: "Request body must be a JSON object with dental data and callback meta (jobId, prospectId, callbackUrl, callbackToken).",
    });
  }

  const { jobId, prospectId, userId, callbackUrl, callbackToken } = payload;
  if (!jobId || !prospectId || !callbackUrl || !callbackToken) {
    log("warn", "POST /api/dental-async missing required fields", { jobId: !!jobId, prospectId: !!prospectId, callbackUrl: !!callbackUrl, callbackToken: !!callbackToken });
    return res.status(400).json({
      error: "Invalid body",
      message: "jobId, prospectId, callbackUrl, and callbackToken are required.",
    });
  }
  if (!isCallbackUrlAllowed(callbackUrl)) {
    log("warn", "POST /api/dental-async callback URL not allowed", callbackUrl);
    return res.status(400).json({
      error: "Invalid callback URL",
      message: "callbackUrl must be HTTPS (or HTTP for localhost). If ALLOWED_CALLBACK_ORIGINS is set, origin must be in that list.",
    });
  }

  log("info", "POST /api/dental-async 202 accepted", { jobId, prospectId });
  res.status(202).json({ id: jobId, status: "accepted" });

  const token = String(callbackToken);
  const url = String(callbackUrl);

  Promise.resolve()
    .then(() => {
      const renderOpts = getRenderOptionsFromPayload(payload);
      const data = stripMetaForGenerate(payload);
      const html = obfuscateHtml(renderPage(data, renderOpts));
      return postCallback(url, token, {
        jobId,
        prospectId,
        userId: userId ?? undefined,
        html,
      });
    })
    .catch((err) => {
      const errorMessage = err?.message ?? String(err);
      log("error", "dental-async job failed", { jobId, prospectId, error: errorMessage });
      return postCallback(url, token, {
        jobId,
        prospectId,
        userId: userId ?? undefined,
        error: errorMessage,
      });
    });
});

/** POST /api/generate — DISABLED. Use /api/dental or /api/dental-async instead. */
app.post("/api/generate", requireApiKey, (req, res) => {
  log("info", "POST /api/generate 503 — endpoint disabled, use /api/dental or /api/dental-async");
  res.status(503).json({
    error: "Endpoint disabled",
    message: "Generic sync generate is disabled for now. Use POST /api/dental or POST /api/dental-async instead.",
  });
});

/** POST /api/generate-async — DISABLED. Use /api/dental-async instead. */
app.post("/api/generate-async", requireApiKey, (req, res) => {
  log("info", "POST /api/generate-async 503 — endpoint disabled, use /api/dental-async");
  res.status(503).json({
    error: "Endpoint disabled",
    message: "Generic async generate is disabled for now. Use POST /api/dental-async instead.",
  });
});

/** Optional: GET / — simple info */
app.get("/", (req, res) => {
  res.status(200).json({
    service: "Website Template Agent",
    version: "1.0.0",
    endpoints: {
      "POST /api/generate": "DISABLED — use /api/dental or /api/dental-async",
      "POST /api/generate-async": "DISABLED — use /api/dental-async",
      "POST /api/dental": "Dental: POST JSON body; returns HTML (style randomized); requires Authorization: Bearer <API_KEY>",
      "POST /api/dental-async": "Dental async: POST JSON + callback meta; 202 + callback with html; requires Authorization: Bearer <API_KEY>",
      "GET /api/health": "Health check",
      "GET /api/render-test": "Render HTML; mix/match: ?json=... & ?style=dental-v1|dental-v2|dental-v3|dental-v4",
      "GET /api-docs": "OpenAPI docs (Swagger UI). Disabled if DISABLE_API_DOCS=1",
      "GET /api/openapi.json": "Raw OpenAPI 3 spec (when docs enabled)",
    },
  });
});

app.listen(PORT, () => {
  log("info", "Website Template API listening on", `http://localhost:${PORT}`);
  log("info", "  POST /api/dental — dental JSON → HTML; POST /api/dental-async — async + callback");
  log("info", "  GET /api/health — health; GET /api/render-test — ?json=&?style=; GET /api-docs — Swagger");
  if (DISABLE_API_DOCS) log("info", "  API docs disabled (DISABLE_API_DOCS=1)");
  if (DEBUG) log("info", "  Debug logging: enabled (DEBUG=1)");
});
