import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  StitchDailyQuotaExceededError,
  withDailyGenerationQuota,
} from "@/lib/stitch/daily-generation-quota";

describe("daily-generation-quota", () => {
  let stateFile: string;
  let prevLimit: string | undefined;
  let prevState: string | undefined;

  beforeEach(() => {
    stateFile = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), "stitch-quota-")),
      "state.json",
    );
    prevLimit = process.env.STITCH_DAILY_GENERATION_LIMIT;
    prevState = process.env.STITCH_DAILY_GENERATION_STATE_FILE;
    process.env.STITCH_DAILY_GENERATION_STATE_FILE = stateFile;
    process.env.STITCH_DAILY_GENERATION_LIMIT = "2";
  });

  afterEach(() => {
    if (prevLimit === undefined) delete process.env.STITCH_DAILY_GENERATION_LIMIT;
    else process.env.STITCH_DAILY_GENERATION_LIMIT = prevLimit;
    if (prevState === undefined) {
      delete process.env.STITCH_DAILY_GENERATION_STATE_FILE;
    } else {
      process.env.STITCH_DAILY_GENERATION_STATE_FILE = prevState;
    }
  });

  it("allows up to the limit then throws", async () => {
    await expect(withDailyGenerationQuota(async () => "a")).resolves.toBe("a");
    await expect(withDailyGenerationQuota(async () => "b")).resolves.toBe("b");
    await expect(withDailyGenerationQuota(async () => "c")).rejects.toThrow(
      StitchDailyQuotaExceededError,
    );
  });

  it("rolls back the counter when generation fails", async () => {
    process.env.STITCH_DAILY_GENERATION_LIMIT = "1";
    await expect(
      withDailyGenerationQuota(async () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");

    await expect(withDailyGenerationQuota(async () => "ok")).resolves.toBe("ok");
    await expect(withDailyGenerationQuota(async () => "no")).rejects.toThrow(
      StitchDailyQuotaExceededError,
    );
  });
});
