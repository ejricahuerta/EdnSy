#!/usr/bin/env node
/**
 * Pitch Rosetta Website Agent — HTTP API
 *
 * POST /api/generate      — body: business data (JSON); returns { id, publicUrl?, plan?, branding? } (no html). Requires API key.
 * POST /api/generate-async — body: business data + jobId, prospectId, userId?, callbackUrl, callbackToken; returns 202; runs generate in background and POSTs result to callbackUrl. Requires API key.
 * GET  /api/health       — 200 OK (readiness)
 *
 * Usage: node server.js [--port=3000]
 * Requires CLAUDE_API_KEY (or ANTHROPIC_API_KEY) and optional Supabase env for upload. Set DEMO_GENERATOR_API_KEY (or PITCH_ROSETTA_API_KEY) to secure POST endpoints.
 * Set DEBUG=1 or DEBUG=pitch-rosetta for debug logging.
 */

import express from "express";
import { generate } from "./generate.js";

const DEBUG = /^(1|true|yes|pitch-rosetta)$/i.test((process.env.DEBUG ?? "").trim());

function debug(...args) {
  if (DEBUG) console.log("[pitch-rosetta]", ...args);
}

const PORT = parseInt(process.env.PORT ?? "3000", 10);
const MAX_BODY_SIZE = "1mb";

const API_KEY = (process.env.DEMO_GENERATOR_API_KEY ?? process.env.PITCH_ROSETTA_API_KEY ?? "").trim();
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
    debug("Unauthorized: missing or invalid Bearer token");
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

/** Strip meta fields from payload so only business data is passed to generate(). Keeps id for Supabase filename. */
function stripMetaForGenerate(payload) {
  const { callbackUrl, callbackToken, jobId, prospectId, userId, ...rest } = payload;
  return rest;
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
      console.error("[generate-async] callback failed", callbackUrl, res.status, text);
    } else {
      debug("callback succeeded", callbackUrl, res.status);
    }
  } catch (err) {
    debug("callback error", callbackUrl, err?.message ?? err);
    console.error("[generate-async] callback error", callbackUrl, err?.message ?? err);
  }
}

const app = express();

app.use(express.json({ limit: MAX_BODY_SIZE }));
app.use((req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  if (DEBUG) {
    const start = Date.now();
    res.on("finish", () => debug(req.method, req.path, res.statusCode, `${Date.now() - start}ms`));
  }
  next();
});

/** GET /api/health — readiness */
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "pitch-rosetta-agent" });
});

/** POST /api/generate — body: business data (index.json shape); returns id, publicUrl, plan, branding (no html). Requires API key. */
app.post("/api/generate", requireApiKey, async (req, res) => {
  debug("POST /api/generate", { bodyKeys: req.body ? Object.keys(req.body) : [] });
  const data = req.body;
  if (!data || typeof data !== "object") {
    debug("generate: invalid body");
    return res.status(400).json({
      error: "Invalid body",
      message: "Request body must be a JSON object (business data).",
    });
  }

  try {
    debug("generate: starting", { id: data?.id });
    const result = await generate(data, { upload: true });
    debug("generate: done", { id: result.id, hasPublicUrl: !!result.publicUrl });
    res.status(200).json({
      id: result.id,
      plan: result.plan || undefined,
      branding: result.branding || undefined,
      publicUrl: result.publicUrl || undefined,
    });
  } catch (err) {
    const message = err?.message ?? String(err);
    debug("generate: error", message);
    const isAuth = /API_KEY|api key|anthropic/i.test(message);
    const status = isAuth ? 503 : 500;
    res.status(status).json({
      error: isAuth ? "Service configuration error" : "Generation failed",
      message: message,
    });
  }
});

/** POST /api/generate-async — body: business data + jobId, prospectId, userId?, callbackUrl, callbackToken. Returns 202; runs generate in background and POSTs to callbackUrl. */
app.post("/api/generate-async", requireApiKey, (req, res) => {
  debug("POST /api/generate-async", { bodyKeys: req.body ? Object.keys(req.body) : [] });
  const payload = req.body;
  if (!payload || typeof payload !== "object") {
    debug("generate-async: invalid body");
    return res.status(400).json({
      error: "Invalid body",
      message: "Request body must be a JSON object with business data and callback meta.",
    });
  }

  const { jobId, prospectId, userId, callbackUrl, callbackToken } = payload;
  if (!jobId || !prospectId || !callbackUrl || !callbackToken) {
    debug("generate-async: missing required fields", { jobId: !!jobId, prospectId: !!prospectId, callbackUrl: !!callbackUrl, callbackToken: !!callbackToken });
    return res.status(400).json({
      error: "Invalid body",
      message: "jobId, prospectId, callbackUrl, and callbackToken are required.",
    });
  }
  if (!isCallbackUrlAllowed(callbackUrl)) {
    debug("generate-async: callback URL not allowed", callbackUrl);
    return res.status(400).json({
      error: "Invalid callback URL",
      message: "callbackUrl must be HTTPS (or HTTP for localhost). If ALLOWED_CALLBACK_ORIGINS is set, origin must be in that list.",
    });
  }

  debug("generate-async: accepted", { jobId, prospectId, callbackUrl });
  res.status(202).json({ id: jobId, status: "accepted" });

  const data = stripMetaForGenerate(payload);
  const token = String(callbackToken);
  const url = String(callbackUrl);

  generate(data, { upload: true })
    .then((result) => {
      debug("generate-async: job completed", { jobId, prospectId, id: result.id, hasPublicUrl: !!result.publicUrl });
      return postCallback(url, token, {
        jobId,
        prospectId,
        userId: userId ?? undefined,
        publicUrl: result.publicUrl ?? undefined,
        html: result.html ?? undefined,
      });
    })
    .catch((err) => {
      const errorMessage = err?.message ?? String(err);
      debug("generate-async: job failed", { jobId, prospectId, error: errorMessage });
      console.error("[generate-async] failed", jobId, prospectId, errorMessage);
      return postCallback(url, token, {
        jobId,
        prospectId,
        userId: userId ?? undefined,
        error: errorMessage,
      });
    });
});

/** Optional: GET / — simple info */
app.get("/", (req, res) => {
  res.status(200).json({
    service: "Pitch Rosetta Website Agent",
    version: "1.0.0",
    endpoints: {
      "POST /api/generate": "Generate (sync); requires Authorization: Bearer <API_KEY>",
      "POST /api/generate-async": "Generate (async, 202 + callback); requires Authorization: Bearer <API_KEY>",
      "GET /api/health": "Health check",
    },
  });
});

app.listen(PORT, () => {
  console.log(`Pitch Rosetta API listening on http://localhost:${PORT}`);
  console.log("  POST /api/generate      — sync (returns id, publicUrl, plan, branding)");
  console.log("  POST /api/generate-async — async (202 + callback)");
  console.log("  GET  /api/health       — health check");
  if (DEBUG) console.log("  Debug logging: enabled (DEBUG=1)");
});
