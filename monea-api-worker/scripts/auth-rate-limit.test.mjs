import assert from "node:assert/strict";
import test from "node:test";
import { webcrypto } from "node:crypto";
import { hashPasswordResetToken, isHashedPasswordResetToken } from "../lib/password-reset-token.ts";
import { incrementLoginFailureCounter } from "../lib/login-failure-counter.ts";
import { hashRateLimitKey } from "../lib/rate-limit-key.ts";
import { ResilientRatelimit } from "../lib/ratelimit.ts";
import { createExchangeTicket, verifyExchangeTicket } from "../lib/exchange-ticket.ts";
import { isTokenRevoked, revokeToken } from "../lib/token-revocation.ts";
import { getIP } from "../lib/utils.ts";

if (!globalThis.crypto) {
    globalThis.crypto = webcrypto;
}

const ENV_KEYS = [
    "NODE_ENV",
    "ENVIRONMENT",
    "SECURITY_PEPPER",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
];

async function withEnvironment(values, callback) {
    const original = new Map(ENV_KEYS.map((key) => [key, process.env[key]]));
    for (const key of ENV_KEYS) {
        if (Object.hasOwn(values, key)) process.env[key] = values[key];
        else delete process.env[key];
    }

    try {
        return await callback();
    } finally {
        for (const [key, value] of original) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
        }
    }
}

const productionWithRedis = {
    NODE_ENV: "production",
    ENVIRONMENT: "production",
    UPSTASH_REDIS_REST_URL: "https://redis.example.invalid",
    UPSTASH_REDIS_REST_TOKEN: "test-token",
};

test("password-reset tokens produce a stable, correctly sized HMAC digest", async () => {
    await withEnvironment({
        SECURITY_PEPPER: "test-pepper-for-reset-token-unit-tests",
    }, async () => {
        const digest = await hashPasswordResetToken("reset-code-123");
        assert.match(digest, /^hmac-sha256:[0-9a-f]{64}$/);
        assert.equal(await hashPasswordResetToken("reset-code-123"), digest);
        assert.notEqual(await hashPasswordResetToken("different-reset-code"), digest);
        assert.equal(isHashedPasswordResetToken(digest), true);
        assert.equal(isHashedPasswordResetToken("legacy-plaintext-token"), false);
    });
});

test("password-reset HMAC digest changes when the pepper changes", async () => {
    const first = await withEnvironment({
        SECURITY_PEPPER: "first-test-pepper-for-reset-tokens",
    }, () => hashPasswordResetToken("same-reset-code"));
    const second = await withEnvironment({
        SECURITY_PEPPER: "second-test-pepper-for-reset-tokens",
    }, () => hashPasswordResetToken("same-reset-code"));

    assert.notEqual(first, second);
});

test("rate limit email keys are stable HMACs that do not contain the email", async () => {
    await withEnvironment({ SECURITY_PEPPER: "test-pepper-for-rate-limit-key-tests" }, async () => {
        const key = await hashRateLimitKey("member@example.test");
        assert.match(key, /^hmac-sha256:[0-9a-f]{64}$/);
        assert.equal(await hashRateLimitKey("member@example.test"), key);
        assert.notEqual(await hashRateLimitKey("another@example.test"), key);
        assert.equal(key.includes("member"), false);
    });
});

test("rate limit key hashing reads the security pepper from Cloudflare bindings", async () => {
    const requestEnvironment = {
        NODE_ENV: "production",
        ENVIRONMENT: "production",
        SECURITY_PEPPER: "a-production-test-pepper-that-is-long-enough",
    };

    await withEnvironment({
        NODE_ENV: "production",
        ENVIRONMENT: "production",
    }, async () => {
        const key = await hashRateLimitKey("admin:user-123", requestEnvironment);
        assert.match(key, /^hmac-sha256:[0-9a-f]{64}$/);
    });
});

test("exchange tickets can be consumed only once outside production", async () => {
    await withEnvironment({ NODE_ENV: "test" }, async () => {
        const secret = new TextEncoder().encode("unit-test-exchange-secret");
        const ticket = await createExchangeTicket("session-token", secret);

        assert.equal(await verifyExchangeTicket(ticket, secret), "session-token");
        assert.equal(await verifyExchangeTicket(ticket, secret), null);
    });
});

test("production exchange tickets are atomically consumed only once", async () => {
    const values = new Map();
    const store = {
        async set(key, value, options) {
            assert.equal(options.ex, 60);
            assert.equal(options.nx, true);
            if (values.has(key)) return null;
            values.set(key, value);
            return "OK";
        },
        async del(key) {
            return values.delete(key) ? 1 : 0;
        },
    };

    await withEnvironment(productionWithRedis, async () => {
        const secret = new TextEncoder().encode("unit-test-exchange-secret");
        const ticket = await createExchangeTicket("session-token", secret, () => store);
        const results = await Promise.all([
            verifyExchangeTicket(ticket, secret, () => store),
            verifyExchangeTicket(ticket, secret, () => store),
        ]);

        assert.equal(results.filter((result) => result === "session-token").length, 1);
        assert.equal(results.filter((result) => result === null).length, 1);
    });
});

test("production exchange tickets fail closed when Redis is unavailable", async () => {
    await withEnvironment(productionWithRedis, async () => {
        const secret = new TextEncoder().encode("unit-test-exchange-secret");
        await assert.rejects(
            createExchangeTicket("session-token", secret, () => null),
            /Exchange ticket storage is not configured/,
        );
    });
});

test("production exchange verification fails closed when Redis is unavailable", async () => {
    const secret = new TextEncoder().encode("unit-test-exchange-secret");
    const ticket = await withEnvironment({ NODE_ENV: "test" }, () =>
        createExchangeTicket("session-token", secret),
    );

    await withEnvironment(productionWithRedis, async () => {
        await assert.rejects(
            verifyExchangeTicket(ticket, secret, () => null),
            /Exchange ticket storage is not configured/,
        );
    });
});

test("session token revocation is idempotent and checked in development", async () => {
    await withEnvironment({ NODE_ENV: "test" }, async () => {
        const jti = `test-session-${crypto.randomUUID()}`;
        const exp = Math.floor(Date.now() / 1000) + 60;

        assert.equal(await isTokenRevoked(jti), false);
        await revokeToken(jti, exp);
        await revokeToken(jti, exp);
        assert.equal(await isTokenRevoked(jti), true);
    });
});

test("production session revocation uses Redis with token expiration", async () => {
    const values = new Map();
    const store = {
        async set(key, value, options) {
            assert.match(key, /^auth:revoked:test-session-/);
            assert.equal(value, "1");
            assert.ok(options.ex > 0 && options.ex <= 60);
            values.set(key, value);
            return "OK";
        },
        async get(key) {
            return values.get(key) ?? null;
        },
    };

    await withEnvironment(productionWithRedis, async () => {
        const jti = `test-session-${crypto.randomUUID()}`;
        await revokeToken(jti, Math.floor(Date.now() / 1000) + 60, () => store);
        assert.equal(await isTokenRevoked(jti, () => store), true);
        assert.equal(await isTokenRevoked("not-revoked", () => store), false);
    });
});

test("production session revocation fails closed when Redis is missing or unavailable", async () => {
    await withEnvironment(productionWithRedis, async () => {
        await assert.rejects(revokeToken("missing-store", Math.floor(Date.now() / 1000) + 60, () => null), /storage is not configured/);
        await assert.rejects(isTokenRevoked("missing-store", () => null), /storage is not configured/);

        const unavailableStore = {
            async set() {
                throw new Error("Redis unavailable");
            },
            async get() {
                throw new Error("Redis unavailable");
            },
        };
        await assert.rejects(revokeToken("redis-error", Math.floor(Date.now() / 1000) + 60, () => unavailableStore), /Could not persist token revocation/);
        await assert.rejects(isTokenRevoked("redis-error", () => unavailableStore), /Could not check token revocation/);
    });
});

test("password-reset hashing rejects missing, weak, and known-default production peppers", async () => {
    for (const pepper of [undefined, "short", "monea-default-pepper-ch4ng3-me"]) {
        await withEnvironment({
            NODE_ENV: "production",
            ENVIRONMENT: "production",
            ...(pepper === undefined ? {} : { SECURITY_PEPPER: pepper }),
        }, async () => {
            await assert.rejects(
                hashPasswordResetToken("reset-code"),
                /strong SECURITY_PEPPER is required/,
            );
        });
    }
});

test("login failure counter uses compare-and-set retries and locks at the threshold", async () => {
    let failures = 0;
    let lockedUntil = null;
    const increment = () => incrementLoginFailureCounter(
        async () => failures,
        async (expected, next, nextLockedUntil) => {
            if (failures !== expected) return false;
            failures = next;
            lockedUntil = nextLockedUntil;
            return true;
        },
    );

    await Promise.all(Array.from({ length: 12 }, increment));
    assert.equal(failures, 12);
    assert.ok(lockedUntil instanceof Date);
    assert.ok(lockedUntil.getTime() > Date.now());
});

test("login failure counter does not lock an account below the threshold", async () => {
    let failures = 0;
    let lockedUntil = null;
    for (let attempt = 0; attempt < 4; attempt += 1) {
        await incrementLoginFailureCounter(
            async () => failures,
            async (expected, next, nextLockedUntil) => {
                if (failures !== expected) return false;
                failures = next;
                lockedUntil = nextLockedUntil;
                return true;
            },
        );
    }

    assert.equal(failures, 4);
    assert.equal(lockedUntil, null);
});

test("strict production rate limiting rejects incomplete Redis configuration", async () => {
    let factoryCalls = 0;
    const limiter = new ResilientRatelimit("unit-test:missing-config", 1, 60_000, async () => {
        factoryCalls++;
        return null;
    });

    await withEnvironment({
        NODE_ENV: "production",
        ENVIRONMENT: "production",
        UPSTASH_REDIS_REST_URL: "https://redis.example.invalid",
    }, async () => {
        await assert.rejects(limiter.limitStrict("key"), /not configured/);
    });

    assert.equal(factoryCalls, 0);
});

test("strict production rate limiting rejects if the distributed store is unavailable", async () => {
    const limiter = new ResilientRatelimit("unit-test:redis-down", 1, 60_000, async () => ({
        limit: async () => {
            throw new Error("Redis unavailable");
        },
    }));

    await withEnvironment(productionWithRedis, async () => {
        await assert.rejects(limiter.limitStrict("key"), (error) => {
            assert.match(error.message, /Distributed rate limiting is unavailable/);
            assert.equal(error.cause?.message, "Redis unavailable");
            return true;
        });
    });
});

test("strict production rate limiting propagates the distributed decision", async () => {
    const expected = { success: false, limit: 5, remaining: 0, reset: 1234 };
    const receivedKeys = [];
    const limiter = new ResilientRatelimit("unit-test:redis-result", 5, 60_000, async () => ({
        limit: async (key) => {
            receivedKeys.push(key);
            return expected;
        },
    }));

    await withEnvironment(productionWithRedis, async () => {
        assert.deepEqual(await limiter.limitStrict("account-key"), expected);
    });
    assert.deepEqual(receivedKeys, ["account-key"]);
});

test("strict production rate limiting reads Cloudflare bindings from the request environment", async () => {
    const requestEnvironment = {
        NODE_ENV: "production",
        ENVIRONMENT: "production",
        UPSTASH_REDIS_REST_URL: "https://redis.example.invalid",
        UPSTASH_REDIS_REST_TOKEN: "request-bound-token",
    };
    let receivedEnvironment;
    const limiter = new ResilientRatelimit("unit-test:request-env", 5, 60_000, async (env) => {
        receivedEnvironment = env;
        return {
            limit: async () => ({ success: true, limit: 5, remaining: 4, reset: 1234 }),
        };
    });

    await withEnvironment({}, async () => {
        const result = await limiter.limitStrict("key", requestEnvironment);
        assert.equal(result.success, true);
    });

    assert.equal(receivedEnvironment, requestEnvironment);
});

test("strict rate limiting uses the local limiter only outside production", async () => {
    let factoryCalls = 0;
    const limiter = new ResilientRatelimit("unit-test:development", 1, 60_000, async () => {
        factoryCalls++;
        return null;
    });

    await withEnvironment({ NODE_ENV: "development" }, async () => {
        assert.equal((await limiter.limitStrict("dev-key")).success, true);
        assert.equal((await limiter.limitStrict("dev-key")).success, false);
    });
    assert.equal(factoryCalls, 0);
});

test("production non-strict rate limiting fails closed when Redis is unavailable", async () => {
    const limiter = new ResilientRatelimit("unit-test:production-fail-closed", 1, 60_000, async () => ({
        limit: async () => {
            throw new Error("Redis unavailable");
        },
    }));

    await withEnvironment(productionWithRedis, async () => {
        await assert.rejects(limiter.limit("key"), /Distributed rate limiting is unavailable/);
    });
});

test("production non-strict rate limiting rejects if Redis configuration is missing", async () => {
    const limiter = new ResilientRatelimit("unit-test:production-missing-config", 1, 60_000);

    await withEnvironment({
        NODE_ENV: "production",
        ENVIRONMENT: "production",
    }, async () => {
        await assert.rejects(limiter.limit("key"), /Distributed rate limiting is not configured/);
    });
});

test("production client IP uses the trusted Cloudflare header, not forwarded headers", async () => {
    await withEnvironment(productionWithRedis, async () => {
        assert.equal(getIP(new Request("https://api.example.test", {
            headers: {
                "cf-connecting-ip": "203.0.113.5",
                "x-forwarded-for": "198.51.100.10",
                "x-real-ip": "198.51.100.11",
            },
        })), "203.0.113.5");
        assert.equal(getIP(new Request("https://api.example.test", {
            headers: { "x-forwarded-for": "198.51.100.10" },
        })), "unknown");
    });
});

test("local client IP can use forwarded headers when Cloudflare is absent", async () => {
    await withEnvironment({ NODE_ENV: "development" }, async () => {
        assert.equal(getIP(new Request("http://localhost", {
            headers: { "x-forwarded-for": "198.51.100.10, 198.51.100.11" },
        })), "198.51.100.10");
    });
});
