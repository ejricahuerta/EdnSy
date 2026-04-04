import { fail } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import type { Actions } from "./$types";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatSubmittedForDisplay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const local = d.toLocaleString("en-CA", {
    timeZone: "America/Toronto",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return `${local} (Toronto) · ${iso}`;
}

/** Plain body for Resend `text` and for the HTML &lt;pre&gt; copy block. */
function buildLeadEmailPlainText(opts: {
  name: string;
  email: string;
  problem: string;
  submittedAt: string;
}): string {
  const lines = [
    "Ed & Sy — Home hero quiz lead",
    "══════════════════════════════════════",
    "",
    "NAME",
    opts.name,
    "",
    "EMAIL",
    opts.email,
    "",
    "QUIZ SUMMARY",
    opts.problem,
    "",
    "SUBMITTED (UTC)",
    opts.submittedAt,
  ];
  return lines.join("\n");
}

function buildLeadEmailHtml(opts: {
  name: string;
  email: string;
  problem: string;
  submittedAt: string;
}): string {
  const e = escapeHtml;
  const plain = buildLeadEmailPlainText(opts);

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:0 0 14px 0;vertical-align:top;">
        <div style="font:600 11px/1.4 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:#71717a;margin:0 0 6px 0;">
          ${e(label)}
        </div>
        <div style="font:15px/1.5 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;color:#18181b;background:#fafafa;border:1px solid #e4e4e7;border-radius:8px;padding:10px 12px;margin:0;word-break:break-word;">
          ${e(value)}
        </div>
      </td>
    </tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f4f4f5;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f4f4f5;padding:24px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;background:#ffffff;border:1px solid #e4e4e7;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding:20px 22px 16px 22px;border-bottom:1px solid #f4f4f5;background:linear-gradient(135deg,#faf5ff 0%,#ffffff 45%);">
              <p style="margin:0;font:600 13px/1.4 system-ui,-apple-system,sans-serif;color:#18181b;">New home quiz lead</p>
              <p style="margin:4px 0 0 0;font:13px/1.5 system-ui,-apple-system,sans-serif;color:#52525b;">Reply goes to the lead&apos;s email.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 22px 8px 22px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                ${row("Name", opts.name)}
                ${row("Email", opts.email)}
                ${row("Quiz summary", opts.problem)}
                ${row("Submitted", formatSubmittedForDisplay(opts.submittedAt))}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 22px 22px 22px;">
              <div style="font:600 11px/1.4 system-ui,-apple-system,sans-serif;letter-spacing:0.06em;text-transform:uppercase;color:#71717a;margin:8px 0 8px 0;">
                Select all to copy
              </div>
              <pre style="margin:0;font:12px/1.45 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;color:#27272a;background:#fafafa;border:1px solid #e4e4e7;border-radius:8px;padding:14px 16px;white-space:pre-wrap;word-break:break-word;">${e(plain)}</pre>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendLeadEmailResend(opts: {
  apiKey: string;
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  html: string;
  text: string;
}): Promise<Response> {
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: opts.from,
      to: [opts.to],
      reply_to: opts.replyTo,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    }),
  });
}

export const actions = {
  leadLeak: async ({ request, fetch }) => {
    const formData = await request.formData();
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const problem = String(formData.get("problem") ?? "").trim();

    if (!name || !email || !problem) {
      return fail(400, { leadLeakError: "missing_fields" as const });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return fail(400, { leadLeakError: "invalid_email" as const });
    }

    const resendKey = env.RESEND_API_KEY?.trim();
    if (resendKey) {
      const fromEmail = (env.RESEND_FROM_EMAIL ?? "hello@ednsy.com").trim();
      const fromName = (env.RESEND_FROM_NAME ?? "Ed & Sy").trim();
      const toEmail = (env.RESEND_LEAD_TO_EMAIL ?? fromEmail).trim();
      const from = `${fromName} <${fromEmail}>`;
      const submittedAt = new Date().toISOString();
      const subject = `Home quiz lead: ${name}`;
      const payload = { name, email, problem, submittedAt };
      const text = buildLeadEmailPlainText(payload);
      const html = buildLeadEmailHtml(payload);

      const res = await sendLeadEmailResend({
        apiKey: resendKey,
        from,
        to: toEmail,
        replyTo: email,
        subject,
        html,
        text,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error("[leadLeak] Resend returned", res.status, body);
        return fail(502, { leadLeakError: "resend_failed" as const });
      }

      return { leadLeakSuccess: true as const };
    }

    const webhook = env.LEAD_INQUIRY_WEBHOOK_URL;
    if (!webhook) {
      console.warn("[leadLeak] RESEND_API_KEY and LEAD_INQUIRY_WEBHOOK_URL are unset; submission not forwarded");
      return fail(503, { leadLeakError: "not_configured" as const });
    }

    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "landing-home-hero-quiz",
        name,
        email,
        problem,
        submittedAt: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      console.error("[leadLeak] Webhook returned", res.status);
      return fail(502, { leadLeakError: "webhook_failed" as const });
    }

    return { leadLeakSuccess: true as const };
  },
} satisfies Actions;
