const MAX_UPDATE_ATTEMPTS = 32;
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export async function incrementLoginFailureCounter(
    readCurrent: () => Promise<number | null>,
    compareAndSet: (expected: number, next: number, lockedUntil: Date | null) => Promise<boolean>,
): Promise<boolean> {
    for (let attempt = 0; attempt < MAX_UPDATE_ATTEMPTS; attempt += 1) {
        const current = await readCurrent();
        if (current === null) return false;

        const next = current + 1;
        const lockedUntil = next >= LOCKOUT_THRESHOLD
            ? new Date(Date.now() + LOCKOUT_DURATION_MS)
            : null;
        if (await compareAndSet(current, next, lockedUntil)) return true;
    }

    throw new Error("Could not update login failure counter after repeated concurrent changes.");
}
