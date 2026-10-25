export const dynamic = 'force-dynamic';
import { authenticator } from "@otplib/preset-default";
import { prisma } from "@/lib/prisma";

import { corsJsonResponse, corsOptionsResponse } from "@/lib/cors-utils";
import {
    generateFingerprint,
    getCookieHeader,
    getOwnerMfaSetupUser,
    getServerUser,
    signToken,
} from "@/lib/auth";
import { COOKIE_NAMES } from "@/lib/constants";
import { SystemGovernance, GOVERNANCE_ACTIONS } from "@/lib/governance";
import { getIP, formatCambodiaDate } from "@/lib/utils";
import { decryptAndMigrateTotpSecret } from "@/lib/totp-secret";
import { incrementLoginFailureCounter } from "@/lib/login-failure-counter";
import { isRecord, readJsonBodyLimited } from "@/lib/read-json-body-limited";
import { twoFactorVerifyIpLimiter } from "@/lib/ratelimit";



// Configure TOTP tolerance (Window 1 allows +-30s clock drift)
authenticator.options = { window: 1 };
const MAX_TWO_FACTOR_VERIFY_BODY_BYTES = 1_024;

export async function OPTIONS(req: Request) {
    return corsOptionsResponse(req);
}

export async function POST(req: Request) {
    try {
        const sessionUser = await getServerUser(req);
        const setupUser = sessionUser ? null : await getOwnerMfaSetupUser(req);
        const user = sessionUser || setupUser;
        const isOwnerMfaBootstrap = Boolean(setupUser);
        if (!user) return corsJsonResponse({ error: "Unauthorized" }, 401, req);

        const parsedBody = await readJsonBodyLimited(req, MAX_TWO_FACTOR_VERIFY_BODY_BYTES);
        if (parsedBody.kind === "too_large") {
            return corsJsonResponse({ error: "Request body is too large" }, 413, req);
        }
        if (parsedBody.kind !== "ok" || !isRecord(parsedBody.value)) {
            return corsJsonResponse({ error: "Invalid JSON request body" }, 400, req);
        }

        const token = parsedBody.value.token;
        if (typeof token !== "string" || !/^\d{6}$/.test(token)) {
            return corsJsonResponse({ error: "Token must be a six-digit code" }, 400, req);
        }

        const ip = getIP(req);
        if (
            (process.env.NODE_ENV === "production" || process.env.ENVIRONMENT === "production") &&
            ip === "unknown"
        ) {
            console.error("[2FA Verify] Trusted client IP unavailable; rejecting verification.");
            return Response.json(
                { error: "Two-factor verification is temporarily unavailable. Please try again later." },
                { status: 503 },
            );
        }

        let ipLimit: Awaited<ReturnType<typeof twoFactorVerifyIpLimiter.limit>>;
        try {
            ipLimit = await twoFactorVerifyIpLimiter.limit(ip);
        } catch (error) {
            console.error("[RateLimit] 2FA verification protection failed; using in-memory fallback.", error);
            // Graceful degradation: use in-memory limiter fallback
            try {
                ipLimit = await twoFactorVerifyIpLimiter.limit(ip, undefined);
            } catch (fallbackError) {
                console.warn("[RateLimit] In-memory fallback also failed; proceeding without rate limit.", fallbackError);
                ipLimit = { success: true, limit: 30, remaining: 29, reset: Math.ceil((Date.now() + 600000) / 1000) };
            }
        }
        if (!ipLimit.success) {
            return Response.json(
                { error: "Too many verification attempts. Please try again later." },
                { status: 429 },
            );
        }

        // 1. Fetch User / Staff details
        let dbUser: any;
        if (user.type === "admin") {
            dbUser = await prisma.user.findUnique({ 
                where: { id: user.userId }, 
                select: { twoFactorSecret: true, failedAttempts: true, lockedUntil: true, twoFactorEnabled: true }
            });
        } else {
            dbUser = await prisma.staff.findUnique({ 
                where: { id: user.userId }, 
                select: { twoFactorSecret: true, failedAttempts: true, lockedUntil: true } 
            });
        }

        if (!dbUser?.twoFactorSecret) {
            return corsJsonResponse({ error: "2FA is not set up yet" }, 400, req);
        }

        // 2. Brute-force protection check
        if (dbUser.lockedUntil && dbUser.lockedUntil > new Date()) {
            const timeStr = formatCambodiaDate(dbUser.lockedUntil, { hour: '2-digit', minute: '2-digit' });
            return Response.json({ 
                error: `គណនីផ្ទៀងផ្ទាត់ត្រូវបានចាក់សោ (Locked until ${timeStr})` 
            }, { status: 423 });
        }

        // 3. Verify TOTP Token
        const secret = await decryptAndMigrateTotpSecret(
            dbUser.twoFactorSecret,
            encryptedSecret => user.type === "admin"
                ? prisma.user.update({ where: { id: user.userId }, data: { twoFactorSecret: encryptedSecret } })
                : prisma.staff.update({ where: { id: user.userId }, data: { twoFactorSecret: encryptedSecret } }),
        );
        const isValid = authenticator.check(token, secret);
        const userAgent = req.headers.get("user-agent") || "unknown";

        if (isValid) {
            // Reset failure counters and enable 2FA
            if (user.type === "admin") {
                await prisma.user.update({ 
                    where: { id: user.userId }, 
                    data: { twoFactorEnabled: true, failedAttempts: 0, lockedUntil: null } 
                });
            } else {
                await prisma.staff.update({ 
                    where: { id: user.userId }, 
                    data: { twoFactorEnabled: true, failedAttempts: 0, lockedUntil: null } 
                });
            }

            // Audit Logging
            await SystemGovernance.logAction(
                user.userId, 
                user.email || "Unknown", 
                GOVERNANCE_ACTIONS.ENABLE_2FA,
                { role: user.type, platform: "Authenticator" }, 
                ip, 
                userAgent
            );

            if (isOwnerMfaBootstrap) {
                const role = user.role;
                const fingerprint = await generateFingerprint({ headers: req.headers, ip });
                const sessionToken = await signToken(
                    { userId: user.userId, email: user.email, role },
                    { fingerprint, expiresIn: "30d" }
                );
                const headers = new Headers({
                    "Content-Type": "application/json",
                    "Cache-Control": "no-store",
                });
                headers.append(
                    "Set-Cookie",
                    getCookieHeader(COOKIE_NAMES.TOKEN, sessionToken, req, 60 * 60 * 24 * 30)
                );
                headers.append("Set-Cookie", getCookieHeader(COOKIE_NAMES.OWNER_MFA_SETUP, "", req, 0));
                return new Response(JSON.stringify({
                    success: true,
                    message: "2FA verified and enabled successfully",
                    user: { id: user.userId, email: user.email, role },
                }), { status: 200, headers });
            }

            return Response.json(
                { success: true, message: "2FA verified and enabled successfully" },
                { headers: { "Cache-Control": "no-store" } }
            );
        }

        // 4. Invalid Token Handling (Increment failures & Lockout if threshold reached)
        await incrementLoginFailureCounter(
            async () => user.type === "admin"
                ? (await prisma.user.findUnique({
                    where: { id: user.userId },
                    select: { failedAttempts: true },
                }))?.failedAttempts ?? null
                : (await prisma.staff.findUnique({
                    where: { id: user.userId },
                    select: { failedAttempts: true },
                }))?.failedAttempts ?? null,
            async (expected, next, lockedUntil) => {
                const update = user.type === "admin"
                    ? await prisma.user.updateMany({
                        where: { id: user.userId, failedAttempts: expected },
                        data: { failedAttempts: next, lockedUntil },
                    })
                    : await prisma.staff.updateMany({
                        where: { id: user.userId, failedAttempts: expected },
                        data: { failedAttempts: next, lockedUntil },
                    });
                return update.count === 1;
            },
        );

        // Security Audit Log
        await prisma.securityLog.create({
            data: { 
                event: "TWOFA_VERIFY_FAILED", 
                ip, 
                details: "Failed 2FA verification attempt"
            }
        });

        return corsJsonResponse({ error: "ការផ្ទៀងផ្ទាត់មិនត្រឹមត្រូវ (Invalid token)" }, 400, req);

    } catch (error: any) {
        console.error("[2FA Verify Error]:", error);
        return corsJsonResponse({ 
            error: "Internal Server Error", 
            details: error?.message || String(error) 
        }, 500, req);
    }
}

