import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_BUCKET = "admin-ednsy-bucket";
const DEMO_HTML_FOLDER = "demo-html";

function getSupabaseAdmin(): SupabaseClient | null {
  const url = (process.env.SUPABASE_URL ?? "").trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function getDemoHtmlBucket(): string {
  return (process.env.DEMO_HTML_BUCKET ?? DEFAULT_BUCKET).trim() || DEFAULT_BUCKET;
}

/**
 * Upload demo HTML to the same path as apps/admin uploadDemoHtml:
 * `{bucket}/demo-html/{prospectId}.html`
 */
export async function uploadDemoHtmlToStorage(
  prospectId: string,
  html: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      ok: false,
      error:
        "Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    };
  }

  const bucket = getDemoHtmlBucket();
  const path = `${DEMO_HTML_FOLDER}/${prospectId}.html`;
  const body = new TextEncoder().encode(html);

  try {
    const { error } = await supabase.storage.from(bucket).upload(path, body, {
      contentType: "text/html; charset=utf-8",
      upsert: true,
    });
    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
