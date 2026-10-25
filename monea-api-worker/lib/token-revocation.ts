import { getRedis } from "./redis.ts";

const TOKEN_REVOCATION_PREFIX = "auth:revoked:";
const MAX_MEMORY_REVOCATIONS = 1_000;

type TokenRevocationStore = {
    get(key: string): Promise<unknown>;
    set(key: string, value: string, options: { ex: number }): Promise<unknown>;
};

export class TokenRevocationStoreUnavailableError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message);
        this.name = "TokenRevocationStoreUnavailableError";
        if (cause !== undefined) {
            Object.defineProperty(this, "cause", { value: cause, configurable: true });
        }
    }
}

const memoryRevocations = new Map<string, number>();

function isProductionEnvironment(): boolean {
    return process.env.NODE_ENV === "production" || process.env.ENVIRONMENT === "production";
}

function getStore(storeProvider: () => TokenRevocationStore | null): TokenRevocationStore {
    const store = storeProvider();
    if (!store) {
        throw new TokenRevocationStoreUnavailableError("Token revocation storage is not configured.");
    }
    return store;
}

function pruneExpiredMemoryRevocations(now: number): void {
    for (const [jti, expiresAt] of memoryRevocations) {
        if (expiresAt <= now) memoryRevocations.delete(jti);
    }
}

export async function revokeToken(
    jti: string,
    exp: number,
    storeProvider: () => TokenRevocationStore | null = getRedis,
): Promise<void> {
    if (!jti) throw new TypeError("A token ID is required for revocation.");

    const now = Math.floor(Date.now() / 1000);
    const ttl = exp - now;
    if (ttl <= 0) return;

    if (isProductionEnvironment()) {
        const store = getStore(storeProvider);
        try {
            const result = await store.set(`${TOKEN_REVOCATION_PREFIX}${jti}`, "1", { ex: ttl });
            if (result !== "OK") {
                throw new TokenRevocationStoreUnavailableError("Could not persist token revocation.");
            }
        } catch (error) {
            if (error instanceof TokenRevocationStoreUnavailableError) throw error;
            throw new TokenRevocationStoreUnavailableError("Could not persist token revocation.", error);
        }
        return;
    }

    pruneExpiredMemoryRevocations(now);
    if (memoryRevocations.size >= MAX_MEMORY_REVOCATIONS && !memoryRevocations.has(jti)) {
        throw new TokenRevocationStoreUnavailableError("Development token revocation storage is full.");
    }
    memoryRevocations.set(jti, exp);
}

export async function isTokenRevoked(
    jti: string,
    storeProvider: () => TokenRevocationStore | null = getRedis,
): Promise<boolean> {
    if (!jti) return false;

    if (isProductionEnvironment()) {
        const store = getStore(storeProvider);
        try {
            const value = await store.get(`${TOKEN_REVOCATION_PREFIX}${jti}`);
            return value !== null && value !== undefined;
        } catch (error) {
            throw new TokenRevocationStoreUnavailableError("Could not check token revocation.", error);
        }
    }

    const expiresAt = memoryRevocations.get(jti);
    if (!expiresAt || expiresAt <= Math.floor(Date.now() / 1000)) {
        memoryRevocations.delete(jti);
        return false;
    }
    return true;
}
