import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const jobMocks = vi.hoisted(() => ({
  generateScreenHtml: vi.fn(),
}));

const uploadMocks = vi.hoisted(() => ({
  uploadDemoHtmlToStorage: vi.fn(),
}));

vi.mock("@/lib/stitch/generate-screen-html", () => ({
  generateScreenHtml: jobMocks.generateScreenHtml,
}));

vi.mock("@/lib/stitch/upload-demo-html", () => ({
  uploadDemoHtmlToStorage: uploadMocks.uploadDemoHtmlToStorage,
}));

vi.mock("@/lib/stitch/launch-rosetta", () => ({
  getOrCreateProspectProject: vi.fn(() =>
    Promise.resolve({ projectId: "p1" }),
  ),
}));

vi.mock("@/lib/stitch/daily-generation-quota", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/stitch/daily-generation-quota")>();
  return {
    ...actual,
    withDailyGenerationQuota: <T>(fn: () => Promise<T>) => fn(),
  };
});

vi.mock("@/lib/stitch/load-env", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/stitch/load-env")>();
  return {
    ...actual,
    assertStitchCredentials: vi.fn(),
  };
});

import { runCreateAsyncJob } from "@/lib/stitch/run-create-async-job";

const minimalTemplate = {
  business: { name: "N", hours: { Monday: "9–5" } },
  hero: {
    headline: "H",
    subheadline: "S",
    cta: { label: "C", href: "#" },
  },
  images: { hero: "", about: "", unsplashKeywords: [] },
  services: [],
  about: { headline: "", body: "", values: [] },
  stats: [],
  testimonials: [],
  contact: {
    headline: "",
    showForm: false,
    showMap: false,
    mapEmbed: null,
    googleMapsApiKey: null,
  },
  theme: { style: "x", primaryColor: "#000", accentColor: "#fff" },
  seo: { title: "", description: "", keywords: [] },
};

describe("runCreateAsyncJob", () => {
  const prevQuota = process.env.STITCH_DAILY_GENERATION_LIMIT;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STITCH_DAILY_GENERATION_LIMIT = "0";
    jobMocks.generateScreenHtml.mockResolvedValue({
      projectId: "p1",
      screenId: "s1",
      htmlUrl: "https://cdn.example.com/x.html",
      html: "<html>ok</html>",
    });
    uploadMocks.uploadDemoHtmlToStorage.mockResolvedValue({ ok: true });
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
  });

  afterEach(() => {
    if (prevQuota === undefined) delete process.env.STITCH_DAILY_GENERATION_LIMIT;
    else process.env.STITCH_DAILY_GENERATION_LIMIT = prevQuota;
  });

  it("uploads html (best-effort) then POSTs callback with html for admin to persist", async () => {
    const meta = {
      jobId: "job-1",
      prospectId: "prospect-1",
      userId: "user-1",
      callbackUrl: "https://admin.example.com/cb",
      callbackToken: "secret",
    };

    await runCreateAsyncJob(meta, { ...meta, ...minimalTemplate });

    expect(uploadMocks.uploadDemoHtmlToStorage).toHaveBeenCalledWith(
      "prospect-1",
      "<html>ok</html>",
    );
    expect(global.fetch).toHaveBeenCalled();
    const call = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.find(
      (c) => typeof c[0] === "string" && (c[0] as string).includes("admin"),
    );
    expect(call).toBeDefined();
    const init = call![1] as RequestInit;
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      Authorization: "Bearer secret",
    });
    const body = JSON.parse(init.body as string) as Record<string, unknown>;
    expect(body.jobId).toBe("job-1");
    expect(body.prospectId).toBe("prospect-1");
    expect(body.userId).toBe("user-1");
    expect(body.html).toBe("<html>ok</html>");
    expect(body.stitchProjectId).toBe("p1");
    expect(body.error).toBeUndefined();
  });

  it("still POSTs success callback with html when optional Stitch upload fails", async () => {
    uploadMocks.uploadDemoHtmlToStorage.mockResolvedValue({
      ok: false,
      error: "storage full",
    });
    const meta = {
      jobId: "j",
      prospectId: "p",
      callbackUrl: "https://admin.example.com/cb",
      callbackToken: "t",
    };

    await runCreateAsyncJob(meta, { ...meta, ...minimalTemplate });

    const call = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.find(
      (c) => typeof c[0] === "string" && (c[0] as string).includes("admin"),
    );
    const body = JSON.parse((call![1] as RequestInit).body as string) as {
      error?: string;
      html?: string;
    };
    expect(body.error).toBeUndefined();
    expect(body.html).toBe("<html>ok</html>");
  });
});
