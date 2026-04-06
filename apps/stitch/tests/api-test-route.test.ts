import { describe, it, expect, vi, beforeEach } from "vitest";
import { StitchConfigError } from "@/lib/stitch/load-env";

const mocks = vi.hoisted(() => ({
  generateScreenHtml: vi.fn(),
  getOrCreateLaunchRosettaProject: vi.fn(),
  stitchErrorToHttpStatus: vi.fn(() => 500),
}));

vi.mock("@/lib/stitch/launch-rosetta", () => ({
  getOrCreateLaunchRosettaProject: mocks.getOrCreateLaunchRosettaProject,
}));

vi.mock("@/lib/stitch/generate-screen-html", () => ({
  generateScreenHtml: mocks.generateScreenHtml,
  stitchErrorToHttpStatus: mocks.stitchErrorToHttpStatus,
}));

import { StitchError } from "@google/stitch-sdk";
import { POST } from "@/app/api/test/route";

function postRequest(body?: object) {
  return new Request("http://localhost/api/test", {
    method: "POST",
    ...(body !== undefined
      ? {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : {}),
  });
}

describe("POST /api/test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getOrCreateLaunchRosettaProject.mockResolvedValue({
      projectId: "proj-test",
    });
    mocks.generateScreenHtml.mockResolvedValue({
      projectId: "proj-test",
      screenId: "screen-test",
      htmlUrl: "https://example.com/demo.html",
    });
  });

  it("returns 200 with stitch fields and prompt built from chosen dental sample", async () => {
    const res = await POST(postRequest({ sampleId: "downtown-dental" }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body).toMatchObject({
      sampleId: "downtown-dental",
      projectId: "proj-test",
      screenId: "screen-test",
      htmlUrl: "https://example.com/demo.html",
      source: expect.stringContaining("references/sample-admin-demo-payload.json"),
    });

    expect(mocks.generateScreenHtml).toHaveBeenCalledTimes(1);
    const call = mocks.generateScreenHtml.mock.calls[0];
    expect(call?.[0]).toMatchObject({ projectId: "proj-test" });
    const prompt = call?.[1] as string;
    expect(prompt).toContain("Downtown Smile Studio");
    expect(prompt).toContain("source of truth");
    expect(prompt).toContain('"business"');
  });

  it("embeds cafe sample when sampleId is riverside-cafe", async () => {
    const res = await POST(postRequest({ sampleId: "riverside-cafe" }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { sampleId?: string };
    expect(body.sampleId).toBe("riverside-cafe");
    const prompt = mocks.generateScreenHtml.mock.calls[0]?.[1] as string;
    expect(prompt).toContain("Riverside Roastery");
  });

  it("returns 400 for unknown sampleId", async () => {
    const res = await POST(postRequest({ sampleId: "does-not-exist" }));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toContain("Unknown test sample");
  });

  it("returns 400 for invalid JSON body", async () => {
    const res = await POST(
      new Request("http://localhost/api/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not-json{",
      }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 503 when Stitch is not configured", async () => {
    mocks.getOrCreateLaunchRosettaProject.mockRejectedValueOnce(
      new StitchConfigError(),
    );
    const res = await POST(postRequest({ sampleId: "downtown-dental" }));
    expect(res.status).toBe(503);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toContain("STITCH_API_KEY");
  });

  it("returns mapped status for StitchError", async () => {
    mocks.stitchErrorToHttpStatus.mockReturnValueOnce(429);
    mocks.getOrCreateLaunchRosettaProject.mockRejectedValueOnce(
      new StitchError({
        code: "RATE_LIMITED",
        message: "Slow down",
        recoverable: true,
      }),
    );

    const res = await POST(postRequest({ sampleId: "downtown-dental" }));
    expect(res.status).toBe(429);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("RATE_LIMITED");
  });
});
