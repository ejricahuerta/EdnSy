import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mocks = vi.hoisted(() => ({
  runCreateAsyncJob: vi.fn(() => Promise.resolve()),
}));

vi.mock("@/lib/stitch/run-create-async-job", () => ({
  runCreateAsyncJob: mocks.runCreateAsyncJob,
}));

vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return {
    ...actual,
    after: (fn: () => void | Promise<void>) => {
      queueMicrotask(() => {
        void Promise.resolve(fn());
      });
    },
  };
});

import { POST } from "@/app/api/create-async/route";

function jsonRequest(obj: object, auth?: string) {
  return new Request("http://localhost/api/create-async", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(auth !== undefined ? { Authorization: auth } : {}),
    },
    body: JSON.stringify(obj),
  });
}

describe("POST /api/create-async", () => {
  const prevKey = process.env.DEMO_GENERATOR_API_KEY;
  const prevOrigins = process.env.ALLOWED_CALLBACK_ORIGINS;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DEMO_GENERATOR_API_KEY = "test-secret-key";
    delete process.env.ALLOWED_CALLBACK_ORIGINS;
  });

  afterEach(() => {
    if (prevKey === undefined) delete process.env.DEMO_GENERATOR_API_KEY;
    else process.env.DEMO_GENERATOR_API_KEY = prevKey;
    if (prevOrigins === undefined) delete process.env.ALLOWED_CALLBACK_ORIGINS;
    else process.env.ALLOWED_CALLBACK_ORIGINS = prevOrigins;
  });

  it("returns 202 and schedules runCreateAsyncJob", async () => {
    const body = {
      jobId: "job-1",
      prospectId: "prospect-1",
      userId: "user-1",
      callbackUrl: "https://admin.example.com/api/demo/generation-callback",
      callbackToken: "cb-token",
      business: { name: "Acme" },
    };
    const res = await POST(
      jsonRequest(body, "Bearer test-secret-key"),
    );
    expect(res.status).toBe(202);
    const json = (await res.json()) as { id?: string; status?: string };
    expect(json).toEqual({ id: "job-1", status: "accepted" });

    await vi.waitFor(() =>
      expect(mocks.runCreateAsyncJob).toHaveBeenCalledTimes(1),
    );
    expect(mocks.runCreateAsyncJob.mock.calls[0]?.[0]).toMatchObject({
      jobId: "job-1",
      prospectId: "prospect-1",
      userId: "user-1",
      callbackUrl: "https://admin.example.com/api/demo/generation-callback",
      callbackToken: "cb-token",
    });
  });

  it("returns 401 when API key mismatch", async () => {
    const res = await POST(
      jsonRequest(
        {
          jobId: "j",
          prospectId: "p",
          callbackUrl: "https://x.com/cb",
          callbackToken: "t",
        },
        "Bearer wrong",
      ),
    );
    expect(res.status).toBe(401);
    expect(mocks.runCreateAsyncJob).not.toHaveBeenCalled();
  });

  it("returns 400 when callback URL is not allowed", async () => {
    process.env.ALLOWED_CALLBACK_ORIGINS = "https://other.com";
    const res = await POST(
      jsonRequest(
        {
          jobId: "j",
          prospectId: "p",
          callbackUrl: "https://evil.com/cb",
          callbackToken: "t",
        },
        "Bearer test-secret-key",
      ),
    );
    expect(res.status).toBe(400);
    expect(mocks.runCreateAsyncJob).not.toHaveBeenCalled();
  });

  it("returns 400 when required fields missing", async () => {
    const res = await POST(
      jsonRequest({ jobId: "j" }, "Bearer test-secret-key"),
    );
    expect(res.status).toBe(400);
    expect(mocks.runCreateAsyncJob).not.toHaveBeenCalled();
  });
});
