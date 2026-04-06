import fs from "node:fs";
import path from "node:path";

export class StitchDailyQuotaExceededError extends Error {
  readonly code = "DAILY_QUOTA_EXCEEDED" as const;
  readonly limit: number;
  readonly used: number;

  constructor(limit: number, used: number) {
    super(
      `Daily Stitch generation limit reached (${used}/${limit} for the current UTC day). Try again after UTC midnight.`,
    );
    this.name = "StitchDailyQuotaExceededError";
    this.limit = limit;
    this.used = used;
  }
}

type QuotaState = { date: string; count: number };

function utcDateString(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw.trim() === "") return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/** Max successful generations per UTC calendar day. `0` disables the check. */
export function getDailyGenerationLimit(): number {
  return parsePositiveInt(process.env.STITCH_DAILY_GENERATION_LIMIT, 100);
}

function getStateFilePath(): string {
  const override = process.env.STITCH_DAILY_GENERATION_STATE_FILE?.trim();
  if (override) return path.resolve(override);
  return path.join(process.cwd(), ".stitch", "daily-generation-state.json");
}

function readState(filePath: string): QuotaState {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed !== null &&
      typeof parsed === "object" &&
      !Array.isArray(parsed) &&
      typeof (parsed as QuotaState).date === "string" &&
      typeof (parsed as QuotaState).count === "number" &&
      Number.isFinite((parsed as QuotaState).count) &&
      (parsed as QuotaState).count >= 0
    ) {
      return { date: (parsed as QuotaState).date, count: (parsed as QuotaState).count };
    }
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") {
      console.warn("[stitch] daily quota: could not read state file, resetting:", e);
    }
  }
  return { date: utcDateString(), count: 0 };
}

function writeState(filePath: string, state: QuotaState): void {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(state, null, 0), "utf8");
}

/**
 * Reserves one generation slot before calling Stitch. Rolls back if `fn` throws.
 * No-op when limit is 0.
 */
export async function withDailyGenerationQuota<T>(fn: () => Promise<T>): Promise<T> {
  const limit = getDailyGenerationLimit();
  if (limit <= 0) {
    return fn();
  }

  const filePath = getStateFilePath();
  const today = utcDateString();
  let state = readState(filePath);
  if (state.date !== today) {
    state = { date: today, count: 0 };
  }
  if (state.count >= limit) {
    throw new StitchDailyQuotaExceededError(limit, state.count);
  }

  state = { date: today, count: state.count + 1 };
  writeState(filePath, state);

  try {
    return await fn();
  } catch (e) {
    const rollback = readState(filePath);
    if (rollback.date === today && rollback.count > 0) {
      writeState(filePath, { date: today, count: rollback.count - 1 });
    }
    throw e;
  }
}

export function stitchDailyQuotaToHttpStatus(): number {
  return 429;
}
