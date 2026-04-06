/**
 * Same rules as apps/website-template/server.js — HTTPS or http on localhost;
 * optional ALLOWED_CALLBACK_ORIGINS (comma-separated origins) for extra restriction.
 */

function isLoopback(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === "localhost" || h === "127.0.0.1" || h === "[::1]";
}

function getAllowedOrigins(): string[] {
  return (process.env.ALLOWED_CALLBACK_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isCallbackUrlAllowed(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const u = new URL(url);
    const isHttps = u.protocol === "https:";
    const isHttpLoopback = u.protocol === "http:" && isLoopback(u.hostname);
    if (!isHttps && !isHttpLoopback) return false;
    const allowed = getAllowedOrigins();
    if (allowed.length === 0) return true;
    const origin = u.origin.toLowerCase();
    return allowed.some((a) => origin === a);
  } catch {
    return false;
  }
}
