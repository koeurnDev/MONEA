export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { CryptoUtils } from "@/lib/crypto";
import { SystemGovernance, GOVERNANCE_ACTIONS } from "@/lib/governance";
import { getIP } from "@/lib/utils";
import { isRecord, readJsonBodyLimited } from "@/lib/read-json-body-limited";
import { hashRateLimitKey } from "@/lib/rate-limit-key";
import { twoFactorDisableLimiter } from "@/lib/ratelimit";


import { corsJsonResponse, corsOptionsResponse } from "@/lib/cors-utils";
const MAX_TWO_FACTOR_DISABLE_BODY_BYTES = 1_024;

export async function POST(req: Request) {
    try {
        // 1. Authenticate user passing Request context
        const user = await getServerUser(req);
        if (!user) return corsJsonResponse({ error: "Unauthorized" }, 401, req);

        const ip = getIP(req);
        let ipLimit: Awaited<ReturnType<typeof twoFactorDisableLimiter.limit>>;
        let accountLimit: Awaited<ReturnType<typeof twoFactorDisableLimiter.limit>>;
        try {
            [ipLimit, accountLimit] = await Promise.all([
                twoFactorDisableLimiter.limit(`ip:${ip}`),
                twoFactorDisableLimiter.limit(
                    `account:${await hashRateLimitKey(`${user.type}:${user.userId}`)}`,
                ),
            ]);
        } catch (error) {
            console.error("[RateLimit] 2FA disable protection failed; using in-memory fallback.", error);
            // Graceful degradation: use in-memory limiter fallback
            try {
                [ipLimit, accountLimit] = await Promise.all([
                    twoFactorDisableLimiter.limit(`ip:${ip}`, undefined),
                    twoFactorDisableLimiter.limit(
                        `account:${await hashRateLimitKey(`${user.type}:${user.userId}`)}`,
                        undefined
                    ),
                ]);
            } catch (fallbackError) {
                console.warn("[RateLimit] In-memory fallback also failed; proceeding without rate limit.", fallbackError);
                ipLimit = { success: true, limit: 5, remaining: 4, reset: Math.ceil((Date.now() + 600000) / 1000) };
                accountLimit = { success: true, limit: 5, remaining: 4, reset: Math.ceil((Date.now() + 600000) / 1000) };
            }
        }
        if (!ipLimit.success || !accountLimit.success) {
            return Response.json(
                { error: "Too many attempts. Please try again later." },
                { status: 429 },
            );
        }

        const parsedBody = await readJsonBodyLimited(req, MAX_TWO_FACTOR_DISABLE_BODY_BYTES);
        if (parsedBody.kind === "too_large") {
            return corsJsonResponse({ error: "Request body is too large" }, 413, req);
        }
        if (parsedBody.kind !== "ok" || !isRecord(parsedBody.value)) {
            return corsJsonResponse({ error: "Invalid JSON request body" }, 400, req);
        }
        const { password } = parsedBody.value;
        
        if (typeof password !== "string" || password.length === 0 || password.length > 128) {
            return corsJsonResponse({ error: "Password verification required to disable 2FA" }, 400, req);
        }

        // 2. Security Check: Verify user password
        let dbUser;
        if (user.type === "admin") {
            dbUser = await prisma.user.findUnique({ 
                where: { id: user.userId }, 
                select: { password: true, email: true } 
            });
        } else {
            dbUser = await prisma.staff.findUnique({ 
                where: { id: user.userId }, 
                select: { password: true, email: true } 
            });
        }

        if (!dbUser) {
            return corsJsonResponse({ error: "User account not found" }, 404, req);
        }

        // Handle SSO users who don't have a hashed password stored
        if (!dbUser.password) {
            return corsJsonResponse({ 
                error: "Password verification unavailable for SSO accounts. Please re-authenticate via SSO." 
            }, 400, req);
        }

        const isPasswordValid = await CryptoUtils.compare(password, dbUser.password);
        if (!isPasswordValid) {
            return corsJsonResponse({ error: "Invalid password" }, 401, req);
        }

        // 3. Disable 2FA in Database
        if (user.type === "admin") {
            await prisma.user.update({
                where: { id: user.userId },
                data: {
                    twoFactorEnabled: false,
                    twoFactorSecret: null,
                    twoFactorRecoveryCodes: null
                }
            });
        } else {
            await prisma.staff.update({
                where: { id: user.userId },
                data: {
                    twoFactorEnabled: false,
                    twoFactorSecret: null,
                    twoFactorRecoveryCodes: null
                }
            });
        }

        // 4. Extract Trusted Client Info
        const userAgent = req.headers.get("user-agent") || "unknown";

        // 5. Governance & Audit Logging
        await SystemGovernance.logAction(
            user.userId,
            user.email || dbUser.email || "Unknown",
            GOVERNANCE_ACTIONS.DISABLE_2FA,
            { role: user.type },
            ip,
            userAgent
        );

        // Security Audit Log
        await prisma.securityLog.create({
            data: {
                event: "TWOFA_DISABLED",
                ip,
                details: `2FA disabled by user (${user.type})`
            }
        });

        return Response.json({ success: true, message: "2FA disabled successfully" });

    } catch (error: any) {
        console.error("[2FA Disable Error]:", error);
        return corsJsonResponse({
            error: "Internal Server Error",
            details: error?.message || String(error)
        }, 500, req);
    }
}
