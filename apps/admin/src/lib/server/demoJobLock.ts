/**
 * In-memory lock so only one demo (paid or free) is generated at a time.
 * Used to avoid Claude rate limit errors when Ed & Sy trigger demos internally.
 * Survives server restarts and disconnects: callers also check DB state (isDemoCurrentlyInProgress)
 * and reset stale 'creating' rows (resetStaleFreeDemoCreatingToPending) before processing.
 * For multi-instance deployment, replace with a Redis or DB-backed lock.
 */

let held = false;

/** Returns true if the lock was acquired, false if another demo is already running. */
export function tryAcquireDemoLock(): boolean {
	if (held) return false;
	held = true;
	return true;
}

/** Release the lock. Call in a finally block after processing. */
export function releaseDemoLock(): void {
	held = false;
}
