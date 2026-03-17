import { NextRequest, NextResponse } from "next/server";
import { middleware } from "../middleware";
import * as jose from "jose";
import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import * as auth from "../lib/auth";
import * as ratelimit from "../lib/ratelimit";

// Mock environment variables
process.env.JWT_SECRET = "test-secret-key-at-least-32-chars-long";
process.env.ENCRYPTION_KEY = "test-encryption-key-32-chars-long";
// process.env.NODE_ENV = "production"; // Read-only in some environments
if (process.env.NODE_ENV !== "production") {
    console.warn("[Test] Warning: Tests should ideally run in production mode for middleware security checks.");
}

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

/**
 * Security Test Suite for MONEA Middleware
 */
describe("MONEA Middleware Security Audit", () => {
    
    const createRequest = (path: string, options: any = {}) => {
        const url = `https://monea.com${path}`;
        return new NextRequest(url, {
            headers: options.headers || {},
            method: options.method || "GET",
            ...options
        });
    };

    describe("1. JWT Validation", () => {
        test("Should block request with missing token on protected route", async () => {
            const req = createRequest("/dashboard");
            const res = await middleware(req);
            expect(res.status).toBe(307); // Redirect to login
            expect(res.headers.get("location")).toContain("/login");
        });

        test("Should block request with invalid signature", async () => {
            const invalidToken = "invalid.token.here";
            const req = createRequest("/dashboard", {
                headers: { cookie: `token=${invalidToken}` }
            });
            const res = await middleware(req);
            expect(res.status).toBe(307);
        });

        test("Should block request with expired token (Explicit check)", async () => {
            const expiredToken = await new jose.SignJWT({ userId: "123" })
                .setProtectedHeader({ alg: "HS256" })
                .setIssuedAt(Math.floor(Date.now() / 1000) - 10000)
                .setExpirationTime(Math.floor(Date.now() / 1000) - 5000)
                .sign(SECRET);

            const req = createRequest("/dashboard", {
                headers: { cookie: `token=${expiredToken}` }
            });
            const res = await middleware(req);
            expect(res.status).toBe(307);
        });

        test("Should block request with future-dated token (iat > now)", async () => {
            const futureToken = await new jose.SignJWT({ userId: "123" })
                .setProtectedHeader({ alg: "HS256" })
                .setIssuedAt(Math.floor(Date.now() / 1000) + 10000)
                .sign(SECRET);

            const req = createRequest("/dashboard", {
                headers: { cookie: `token=${futureToken}` }
            });
            const res = await middleware(req);
            expect(res.status).toBe(307);
        });

        test("Should block revoked JWT", async () => {
            const token = await new jose.SignJWT({ userId: "123", jti: "revoked-id" })
                .setProtectedHeader({ alg: "HS256" })
                .setAudience("user")
                .setIssuer("monea:app")
                .sign(SECRET);

            jest.spyOn(auth, 'isTokenRevoked').mockResolvedValue(true);

            const req = createRequest("/dashboard", {
                headers: { cookie: `token=${token}` }
            });
            const res = await middleware(req);
            expect(res.status).toBe(500); // Fail-secure behavior for revoked tokens
        });
    });

    describe("2. CSRF Protection", () => {
        test("Should block POST request with mismatching Origin", async () => {
            const req = createRequest("/api/guestbook", {
                method: "POST",
                headers: { 
                    origin: "https://evil.com",
                    host: "monea.com"
                }
            });
            const res = await middleware(req);
            expect(res.status).toBe(403);
        });

        test("Should block POST request with mismatching Referer", async () => {
            const req = createRequest("/api/guestbook", {
                method: "POST",
                headers: { 
                    referer: "https://external.com/attack",
                    host: "monea.com"
                }
            });
            const res = await middleware(req);
            expect(res.status).toBe(403);
        });

        test("Should block sensitive request with both headers missing (Strict CSRF)", async () => {
            const req = createRequest("/api/guestbook", {
                method: "POST",
                headers: { 
                    host: "monea.com"
                }
            });
            const res = await middleware(req);
            expect(res.status).toBe(403);
        });

        test("Should allow POST request with valid Origin & Referer", async () => {
            const req = createRequest("/api/guestbook", {
                method: "POST",
                headers: { 
                    origin: "https://monea.com",
                    referer: "https://monea.com/guestbook",
                    host: "monea.com"
                }
            });
            const res = await middleware(req);
            expect(res.status).not.toBe(403);
        });
    });

    describe("3. Anti-Replay (Fingerprinting)", () => {
        test("Should block JWT if fingerprint is missing or mismatched", async () => {
            const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
            const ip = "1.2.3.4";
            
            // Generate valid fingerprint
            const data = new TextEncoder().encode(`${userAgent}|${ip}`);
            const hashBuffer = await crypto.subtle.digest("SHA-256", data);
            const validFingerprint = Array.from(new Uint8Array(hashBuffer))
                .map(b => b.toString(16).padStart(2, "0")).join("").substring(0, 32);

            const tokenWithFingerprint = await new jose.SignJWT({ userId: "123", fingerprint: validFingerprint })
                .setProtectedHeader({ alg: "HS256" })
                .setAudience("user")
                .setIssuer("monea:app")
                .sign(SECRET);

            // 1. Success with correct headers
            const reqSuccess = createRequest("/dashboard", {
                headers: { 
                    cookie: `token=${tokenWithFingerprint}`,
                    "user-agent": userAgent,
                    "x-forwarded-for": ip
                }
            });
            const resSuccess = await middleware(reqSuccess);
            expect(resSuccess.status).not.toBe(307);

            // 2. Failure with different IP (mismatched fingerprint)
            const reqFail = createRequest("/dashboard", {
                headers: { 
                    cookie: `token=${tokenWithFingerprint}`,
                    "user-agent": userAgent,
                    "x-forwarded-for": "9.9.9.9"
                }
            });
            const resFail = await middleware(reqFail);
            expect(resFail.status).toBe(307);
        });

        test("Should delete cookie on redirect to login", async () => {
            const req = createRequest("/dashboard");
            const res = await middleware(req);
            expect(res.status).toBe(307);
            
            // In Next.js middleware, headers.get('set-cookie') is how we check deleted/added cookies
            const setCookie = res.headers.get("set-cookie");
            expect(setCookie).toContain("token=;");
            expect(setCookie).toContain("Max-Age=0");
        });
    });

    describe("3. Bot Protection", () => {
        test("Should block requests from known bot user-agents", async () => {
            const req = createRequest("/", {
                headers: { "user-agent": "python-requests/2.25.1" }
            });
            const res = await middleware(req);
            expect(res.status).toBe(403);
        });
    });

    describe("4. Rate Limiting", () => {
        test("Should block request when rate limit exceeded", async () => {
            // Mock the resilient limiter to return failure
            jest.spyOn(ratelimit.standardLimiter, 'limit').mockResolvedValue({
                success: false,
                limit: 100,
                remaining: 0,
                reset: 12345678
            });

            const req = createRequest("/api/some-endpoint", {
                headers: { "x-forwarded-for": "1.2.3.4" }
            });
            const res = await middleware(req);
            expect(res.status).toBe(429);
        });
    });

    describe("4. Fail-Secure Behavior", () => {
        test("Should return 500 on internal middleware crash", async () => {
            // Force a crash by deleting a required constant or similar (if possible in test env)
            // Or mock jwtVerify to throw a non-standard error
            jest.spyOn(jose, 'jwtVerify').mockImplementationOnce(() => {
                throw new Error("Simulated Crash");
            });

            const req = createRequest("/dashboard", {
                headers: { cookie: "token=valid-looking-token" }
            });
            const res = await middleware(req);
            expect(res.status).toBe(500);
            const data = await res.json();
            expect(data.error).toBe("Internal Server Error");
        });
    });

    describe("5. Security Headers", () => {
        test("Should apply all security headers on every response", async () => {
            const req = createRequest("/");
            const res = await middleware(req);
            expect(res.headers.get("X-Frame-Options")).toBe("DENY");
            expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
            expect(res.headers.get("Content-Security-Policy")).toContain("default-src 'self'");
        });
    });
});
