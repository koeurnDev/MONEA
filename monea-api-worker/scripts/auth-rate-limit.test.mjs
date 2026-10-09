import assert from "node:assert/strict";
import test from "node:test";
import { webcrypto } from "node:crypto";
import { hashPasswordResetToken, isHashedPasswordResetToken } from "../lib/password-reset-token.ts";
import { ResilientRatelimit } from "../lib/ratelimit.ts";

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
        await assert.rejects(limiter.limitStrict("key"), /Redis unavailable/);
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
