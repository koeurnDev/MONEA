export const dynamic = 'force-dynamic';
import { authenticator } from "@otplib/preset-default";
import QRCode from "qrcode-svg";
import { prisma } from "@/lib/prisma";
import { getOwnerMfaSetupUser, getServerUser } from "@/lib/auth";
import { CryptoUtils } from "@/lib/crypto";
import { encryptTotpSecret } from "@/lib/totp-secret";
import { isRecord, readJsonBodyLimited } from "@/lib/read-json-body-limited";
import { hashRateLimitKey } from "@/lib/rate-limit-key";
import { getIP } from "@/lib/utils";
import { twoFactorSetupLimiter } from "@/lib/ratelimit";
import { corsJsonResponse, corsOptionsResponse } from "@/lib/cors-utils";

const MAX_TWO_FACTOR_SETUP_BODY_BYTES = 1_024;

export async function OPTIONS(req: Request) {
    return corsOptionsResponse(req);
}

export async function POST(req: Request, env?: Record<string, unknown>) {
    try {
        console.log('[2FA Setup] Starting POST request');
        const cookieHeader = req.headers.get('cookie');
        const authHeader = req.headers.get('authorization');
        console.log(`[2FA Setup] Cookie header present: ${!!cookieHeader}`);
        console.log(`[2FA Setup] Authorization header present: ${!!authHeader}`);
        if (cookieHeader) {
            console.log(`[2FA Setup] Cookie contains owner_mfa_setup: ${cookieHeader.includes('owner_mfa_setup')}`);
            console.log(`[2FA Setup] Cookie contains token: ${cookieHeader.includes('token=')}`);
        }
        
        const sessionUser = await getServerUser(req);
        console.log(`[2FA Setup] Session user found: ${!!sessionUser}`);
        
        const setupUser = sessionUser ? null : await getOwnerMfaSetupUser(req);
        console.log(`[2FA Setup] Setup user found: ${!!setupUser}`);
        
        const user = sessionUser || setupUser;
        const isOwnerMfaBootstrap = Boolean(setupUser);
        
        if (!user) {
            console.warn('[2FA Setup] No user found - returning 401');
            return corsJsonResponse({ error: "Unauthorized" }, 401, req);
        }
        
        console.log(`[2FA Setup] User type: ${user.type}, Bootstrap mode: ${isOwnerMfaBootstrap}`);

        const parsedBody = await readJsonBodyLimited(req, MAX_TWO_FACTOR_SETUP_BODY_BYTES);
        if (parsedBody.kind === "too_large") {
            return corsJsonResponse({ error: "Request body is too large" }, 413, req);
        }
        if (parsedBody.kind !== "ok" || !isRecord(parsedBody.value)) {
            return corsJsonResponse({ error: "Invalid JSON request body" }, 400, req);
        }
        const password = parsedBody.value.password;

        if (password !== undefined &&
            (typeof password !== "string" || password.length === 0 || password.length > 128)) {
            return corsJsonResponse({ error: "Password must be a string of at most 128 characters" }, 400, req);
        }
        if (!isOwnerMfaBootstrap && typeof password !== "string") {
            return corsJsonResponse({ error: "Password is required" }, 400, req);
        }

        const ip = getIP(req);
        let ipLimit: Awaited<ReturnType<typeof twoFactorSetupLimiter.limit>>;
        let accountLimit: Awaited<ReturnType<typeof twoFactorSetupLimiter.limit>>;
        try {
            const accountKey = await hashRateLimitKey(`${user.type}:${user.userId}`, env);
            [ipLimit, accountLimit] = await Promise.all([
                twoFactorSetupLimiter.limit(`ip:${ip}`, env),
                twoFactorSetupLimiter.limit(`account:${accountKey}`, env),
            ]);
        } catch (error) {
            console.error("[RateLimit] 2FA setup protection degraded; allowing request with in-memory fallback.", error);
            // Graceful degradation: use in-memory limiter as fallback
            // Allow the request to proceed rather than reject with 503
            const accountKey = await hashRateLimitKey(`${user.type}:${user.userId}`, env);
            try {
                [ipLimit, accountLimit] = await Promise.all([
                    twoFactorSetupLimiter.limit(`ip:${ip}`, undefined),
                    twoFactorSetupLimiter.limit(`account:${accountKey}`, undefined),
                ]);
            } catch (fallbackError) {
                // Even fallback failed, allow request to proceed (user experience takes priority)
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

        if (!isOwnerMfaBootstrap) {
            // Verify the password before revealing a 2FA secret.
            let dbSecret: string | null = null;
            if (user.type === "admin") {
                const account = await prisma.user.findUnique({ where: { id: user.userId }, select: { password: true } });
                dbSecret = account?.password ?? null;
            } else {
                const account = await prisma.staff.findUnique({ where: { id: user.userId }, select: { password: true } });
                dbSecret = account?.password ?? null;
            }

            // Handle SSO accounts without password
            if (!dbSecret) {
                return corsJsonResponse({
                    error: "Password verification unavailable for SSO accounts. Please set up an account password first."
                }, 400, req);
            }

            if (typeof password !== "string") {
                return corsJsonResponse({ error: "Password is required" }, 400, req);
            }
            if (!(await CryptoUtils.compare(password, dbSecret))) {
                return corsJsonResponse({ error: "Invalid password" }, 401, req);
            }
        }

        // 2. Generate TOTP Secret
        const secret = authenticator.generateSecret();
        const otpauth = authenticator.keyuri(user.email || user.name || "User", "MONEA", secret);

        // 3. Safe SVG Data URL Generation for Edge Runtime
        const qrSvg = new QRCode({ 
            content: otpauth, 
            width: 200, 
            height: 200, 
            color: "#000000", 
            background: "#ffffff", 
            ecl: "M" 
        });
        
        // Edge-safe SVG encoding without btoa unicode issues
        const svgContent = qrSvg.svg();
        const qrCodeDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;

        // 4. Generate 10 recovery codes using Web Crypto API
        const plainRecoveryCodes = Array.from({ length: 10 }, () => {
            const buf = new Uint8Array(5);
            crypto.getRandomValues(buf);
            return Array.from(buf).map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
        });

        // Hash recovery codes for secure storage
        const hashedCodes = await Promise.all(plainRecoveryCodes.map(c => CryptoUtils.hash(c)));
        const recoveryCodesJson = JSON.stringify(hashedCodes);
        const encryptedSecret = await encryptTotpSecret(secret);

        // 5. Save pending 2FA secret (Keep twoFactorEnabled: false until OTP code is verified)
        if (user.type === "admin") {
            await prisma.user.update({
                where: { id: user.userId },
                data: { 
                    twoFactorSecret: encryptedSecret,
                    twoFactorRecoveryCodes: recoveryCodesJson,
                    twoFactorEnabled: false
                },
            });
        } else {
            await prisma.staff.update({
                where: { id: user.userId },
                data: { 
                    twoFactorSecret: encryptedSecret,
                    twoFactorRecoveryCodes: recoveryCodesJson,
                    twoFactorEnabled: false
                },
            });
        }

        return Response.json({ 
            secret, 
            qrCodeDataUrl, 
            recoveryCodes: plainRecoveryCodes 
        }, { headers: { "Cache-Control": "no-store" } });

    } catch (error: any) {
        console.error("[2FA Setup Error]:", error);
        return corsJsonResponse({
            error: "Internal Server Error",
            details: error?.message || String(error),
        }, 500, req);
    }
}
