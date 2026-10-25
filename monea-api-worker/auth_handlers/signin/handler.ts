export const dynamic = 'force-dynamic';
import { authenticator } from "@otplib/preset-default";
import { prisma } from "@/lib/prisma";
import { createOwnerMfaSetupCookies, signToken, generateFingerprint, isSecureCookie, getCookieHeader } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { escapeHtml, sendTelegramAlert } from "@/lib/telegram";
import { CryptoUtils } from "@/lib/crypto";
import { corsJsonResponse, corsOptionsResponse } from "@/lib/cors-utils";
import { authLimiter, authRateLimitAlertGlobalLimiter, authRateLimitAlertLimiter, getIP } from "@/lib/ratelimit";
import { verifyTurnstileDetailed } from "@/lib/turnstile";
import { decryptAndMigrateTotpSecret } from "@/lib/totp-secret";
import { incrementLoginFailureCounter } from "@/lib/login-failure-counter";
import { isRecord, readJsonBodyLimited } from "@/lib/read-json-body-limited";

const MAX_SIGNIN_BODY_BYTES = 16_384;

function maskEmail(email: unknown): string | null {
    if (typeof email !== "string" || email.length > 254) return null;
    const atIndex = email.lastIndexOf("@");
    const domain = email.slice(atIndex + 1);
    if (
        atIndex < 1 ||
        atIndex !== email.indexOf("@") ||
        !/^[a-z0-9.-]+$/i.test(domain)
    ) {
        return null;
    }
    return `${email[0]}***@${domain}`;
}

async function notifyRateLimitedSignIn(req: Request, ip: string): Promise<void> {
    try {
        const [ipAlert, globalAlert] = await Promise.all([
            authRateLimitAlertLimiter.limitStrict(ip),
            authRateLimitAlertGlobalLimiter.limitStrict("all"),
        ]);
        if (!ipAlert.success || !globalAlert.success) return;

        try {
            await prisma.securityLog.create({
                data: {
                    event: "RATE_LIMIT_EXCEEDED",
                    ip,
                    geoIp: req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || "UNKNOWN",
                    userAgent: req.headers.get("user-agent") || "UNKNOWN",
                    details: "Sign-in rate limit reached",
                },
            });
        } catch (error) {
            console.error("[Security] Failed to record sign-in rate limit event:", error);
        }

        void sendTelegramAlert(
            `Repeated sign-in attempts were blocked from IP <code>${escapeHtml(ip)}</code>.`,
        );
    } catch (error) {
        console.error("[Security] Failed to process sign-in rate limit alert:", error);
    }
}

async function consumeRecoveryCode(
    storedCodes: string | null,
    candidate: string,
    consume: (replacement: string, expected: string) => Promise<boolean>,
): Promise<boolean> {
    if (!storedCodes || !/^[A-Fa-f0-9]{10}$/.test(candidate)) return false;

    let hashes: unknown;
    try {
        hashes = JSON.parse(storedCodes);
    } catch {
        return false;
    }
    if (!Array.isArray(hashes) || hashes.some((hash) => typeof hash !== "string")) {
        return false;
    }

    for (let index = 0; index < hashes.length; index += 1) {
        if (await CryptoUtils.compare(candidate, hashes[index])) {
            const remaining = hashes.filter((_, codeIndex) => codeIndex !== index);
            return consume(JSON.stringify(remaining), storedCodes);
        }
    }
    return false;
}

export async function OPTIONS(req: Request) {
    return corsOptionsResponse(req);
}

export async function POST(req: Request) {
    // Rate limiting
    const ip = getIP(req);
    let rateLimit: Awaited<ReturnType<typeof authLimiter.limit>>;
    try {
        rateLimit = await authLimiter.limit(ip);
    } catch (error) {
        console.error("[RateLimit] Distributed sign-in protection failed; using in-memory fallback.", error);
        // Graceful degradation: use in-memory limiter fallback
        try {
            rateLimit = await authLimiter.limit(ip, undefined);
        } catch (fallbackError) {
            // Even fallback failed, allow request to proceed (user experience takes priority)
            console.warn("[RateLimit] In-memory fallback also failed; proceeding without rate limit.", fallbackError);
            rateLimit = { success: true, limit: 5, remaining: 4, reset: Math.ceil((Date.now() + 600000) / 1000) };
        }
    }

    if (!rateLimit.success) {
        console.warn(`[RateLimit] Auth threshold exceeded for IP: ${ip}`);
        await notifyRateLimitedSignIn(req, ip);
        return corsJsonResponse({ error: "Too many login attempts. Please try again later." }, 429, req);
    }

    try {
        const parsedBody = await readJsonBodyLimited(req, MAX_SIGNIN_BODY_BYTES);
        if (parsedBody.kind === "too_large") {
            return corsJsonResponse({ error: "Request body is too large" }, 413, req);
        }
        if (parsedBody.kind === "invalid") {
            return corsJsonResponse({ error: "Invalid request body" }, 400, req);
        }
        const body = parsedBody.value;
        if (!isRecord(body)) {
            return corsJsonResponse({ error: "Invalid request body" }, 400, req);
        }

        const { email, password, turnstileToken, twoFactorToken } = body;
        if (
            typeof email !== "string" ||
            email.trim().length === 0 ||
            email.length > 254 ||
            typeof password !== "string" ||
            password.length === 0 ||
            password.length > 128 ||
            (turnstileToken !== undefined && typeof turnstileToken !== "string") ||
            (twoFactorToken !== undefined && typeof twoFactorToken !== "string")
        ) {
            return corsJsonResponse({ error: "Invalid request body" }, 400, req);
        }
        const normalizedEmail = email.trim().toLowerCase();

        // Standardized IP Detection
        const geoIp = req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || "UNKNOWN";
        const userAgent = req.headers.get("user-agent") || "UNKNOWN";

        // Turnstile CAPTCHA verification
        const isProduction = process.env.NODE_ENV === 'production' || process.env.ENVIRONMENT === 'production';
        const TEST_TURNSTILE_SECRET = '1x0000000000000000000000000000000AA';
        const turnstileSecret = process.env.TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET;
        const turnstileBypassedForDev = !isProduction && !turnstileSecret;

        if (!turnstileBypassedForDev) {
            // In production, if turnstile secret is missing, log warning but allow signin
            // (security: CAPTCHA will fail client-side, but won't block authentication)
            if (!turnstileSecret || turnstileSecret === TEST_TURNSTILE_SECRET) {
                console.warn(
                    '[Turnstile] WARNING: TURNSTILE_SECRET_KEY is missing or set to the test key. Allowing signin to proceed (CAPTCHA verification skipped).'
                );
                // Allow signin to proceed without CAPTCHA in this scenario
            } else if (!turnstileToken || typeof turnstileToken !== 'string') {
                return corsJsonResponse({ error: "សូមផ្ទៀងផ្ទាត់ CAPTCHA ដើម្បីបន្ត។" }, 428, req);
            } else {
                // Only verify CAPTCHA if we have a valid secret and token
                const verification = await verifyTurnstileDetailed(turnstileToken, { remoteip: ip });

                if (!verification.success) {
                    const isVerificationUnavailable = verification.errorCodes?.some((code) =>
                        code === 'request-timeout' ||
                        code === 'internal-error' ||
                        code === 'missing-secret-key' ||
                        (typeof code === 'string' && code.startsWith('http-status-'))
                    );

                    console.warn(
                        `[Turnstile] Signin CAPTCHA rejected for IP ${ip}:`,
                        verification.errorCodes
                    );

                    return Response.json(
                        {
                            error: isVerificationUnavailable
                                ? "សេវាផ្ទៀងផ្ទាត់ CAPTCHA កំពុងរវល់។ សូមព្យាយាមម្ដងទៀត។"
                                : "ការផ្ទៀងផ្ទាត់ CAPTCHA បរាជ័យ។",
                        },
                        { status: isVerificationUnavailable ? 503 : 400 }
                    );
                }
            }
        }

        // IP denylist checks must not be bypassed when the database is unavailable.
        try {
            const isBlacklisted = await prisma.blacklistedIP.findUnique({ where: { ip } });
            if (isBlacklisted) {
                return corsJsonResponse({ error: "ការចូលប្រើរបស់អ្នកត្រូវបានបិទជាបណ្តោះអាសន្ន។" }, 403, req);
            }
        } catch (e) {
            console.error('[Security] IP blacklist check failed; rejecting sign-in.', e);
            return Response.json(
                { error: "Sign-in is temporarily unavailable. Please try again later." },
                { status: 503 }
            );
        }

        // Simplified failure handler for better performance
        const handleFailure = async (account: any, type: "User" | "Staff", customError?: string) => {
            try {
                if (account) {
                    await incrementLoginFailureCounter(
                        async () => type === "User"
                            ? (await prisma.user.findUnique({
                                where: { id: account.id },
                                select: { failedAttempts: true },
                            }))?.failedAttempts ?? null
                            : (await prisma.staff.findUnique({
                                where: { id: account.id },
                                select: { failedAttempts: true },
                            }))?.failedAttempts ?? null,
                        async (expected, next, lockedUntil) => {
                            const result = type === "User"
                                ? await prisma.user.updateMany({
                                    where: { id: account.id, failedAttempts: expected },
                                    data: { failedAttempts: next, lockedUntil },
                                })
                                : await prisma.staff.updateMany({
                                    where: { id: account.id, failedAttempts: expected },
                                    data: { failedAttempts: next, lockedUntil },
                                });
                            return result.count === 1;
                        },
                    );
                }
            } catch (e) {
                console.warn('[Auth] Failed to update failure count:', e);
            }

            try {
                await prisma.securityLog.create({
                    data: {
                        event: "LOGIN_FAILED",
                        ip,
                        geoIp: geoIp || "UNKNOWN",
                        userAgent: userAgent || "UNKNOWN",
                        email: maskEmail(normalizedEmail),
                        details: `${type} authentication failed`,
                    },
                });
            } catch (e) {
                console.error('[Auth] Failed to record sign-in failure:', e);
            }

            // Reduced delay for better UX
            await new Promise(r => setTimeout(r, 500));
            return corsJsonResponse({ error: customError || "អ៊ីមែល ឬ ពាក្យសម្ងាត់មិនត្រឹមត្រូវ" }, 401, req);
        };

        // 1. Check USER
        let user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: {
                id: true,
                email: true,
                password: true,
                lockedUntil: true,
                failedAttempts: true,
                role: true,
                twoFactorEnabled: true,
                twoFactorSecret: true,
                twoFactorRecoveryCodes: true,
                deletedAt: true
            }
        });

        if (user && user.lockedUntil && user.lockedUntil > new Date()) {
            return Response.json({ error: `គណនីចាក់សោរបណ្តោះអាសន្ន (Locked until ${user.lockedUntil.toLocaleTimeString('km-KH', { timeZone: 'Asia/Phnom_Penh' })})` }, { status: 423 });
        }

        if (user && (user as any).deletedAt) {
            return corsJsonResponse({ 
                error: "គណនីនេះត្រូវបានលុបបណ្ដោះអាសន្ន។", 
                details: "គណនីរបស់អ្នកស្ថិតក្នុងអំឡុងពេល ៣០ ថ្ងៃនៃការលុប។ សូមទាក់ទងមកកាន់ពួកយើងបើលោកអ្នកចង់យកវាត្រឡប់មកវិញ voyage" 
            }, 403, req);
        }

        if (user) {
            let isPasswordValid = false;
            if (user.password) {
                isPasswordValid = await CryptoUtils.compare(password, user.password);
                if (isPasswordValid && CryptoUtils.isLegacy(user.password)) {
                    const newHash = await CryptoUtils.hash(password);
                    await prisma.user.update({ where: { id: user.id }, data: { password: newHash } });
                    console.log(`[Security] User ${user.id} migrated to PBKDF2.`);
                }
            }

            if (isPasswordValid) {
                if (user.role === ROLES.PLATFORM_OWNER && !user.twoFactorEnabled) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { failedAttempts: 0, lockedUntil: null },
                    });
                    const origin = req.headers.get('origin') || 'https://moneoez.com';
                    const headers = new Headers({
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": origin,
                        "Access-Control-Allow-Credentials": "true",
                        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CSRF-Token",
                        "Cache-Control": "no-store",
                    });
                    for (const cookie of await createOwnerMfaSetupCookies(req, user)) {
                        headers.append("Set-Cookie", cookie);
                    }
                    return new Response(JSON.stringify({ requireOwnerMfaSetup: true }), {
                        status: 200,
                        headers,
                    });
                }

                if (user.twoFactorEnabled) {
                    const configuredSecret = user.twoFactorSecret;
                    if (!configuredSecret) {
                        console.error(`[Auth] User ${user.id} has 2FA enabled without a configured secret.`);
                        return Response.json(
                            { error: "Two-factor authentication is misconfigured. Please contact support." },
                            { status: 503 }
                        );
                    }
                    if (typeof twoFactorToken !== "string" || !twoFactorToken.trim()) {
                        return corsJsonResponse({ require2FA: true, error: "2FA Token required" }, 428, req);
                    }
                    const suppliedToken = twoFactorToken.trim();

                    const secret = await decryptAndMigrateTotpSecret(
                        configuredSecret,
                        encryptedSecret => prisma.user.update({
                            where: { id: user.id },
                            data: { twoFactorSecret: encryptedSecret },
                        }),
                    );
                    let is2faValid = /^\d{6}$/.test(suppliedToken) &&
                        authenticator.check(suppliedToken, secret);
                    if (!is2faValid) {
                        is2faValid = await consumeRecoveryCode(
                            user.twoFactorRecoveryCodes,
                            suppliedToken,
                            async (replacement, expected) => {
                                const update = await prisma.user.updateMany({
                                    where: { id: user.id, twoFactorRecoveryCodes: expected },
                                    data: { twoFactorRecoveryCodes: replacement },
                                });
                                return update.count === 1;
                            },
                        );
                    }
                    if (!is2faValid) {
                        return await handleFailure(user, "User", "លេខកូដសុវត្ថិភាពមិនត្រឹមត្រូវ");
                    }
                }

                // Reset failure count
                await prisma.user.update({ 
                    where: { id: user.id }, 
                    data: { failedAttempts: 0, lockedUntil: null } 
                });

                // Simplified success logging
                try {
                    await prisma.securityLog.create({ 
                        data: { 
                            event: "LOGIN_SUCCESS", 
                            ip, 
                            geoIp: geoIp || "unknown", 
                            userAgent: userAgent || "unknown", 
                            email: maskEmail(normalizedEmail),
                            details: "User authentication successful" 
                        } 
                    });
                } catch (e) {
                    console.warn('[Auth] Failed to create security log:', e);
                }

                const role = user.role?.toUpperCase() || ROLES.EVENT_MANAGER;
                const fingerprint = await generateFingerprint({ headers: req.headers, ip });
                const token = await signToken({ userId: user.id, email: user.email, role }, { fingerprint, expiresIn: "30d" });

                const origin = req.headers.get('origin') || 'https://moneoez.com';
                const headers = new Headers({ 
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": origin,
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CSRF-Token",
                    "Cache-Control": "no-store",
                });
                headers.append("Set-Cookie", getCookieHeader("token", token, req, 60 * 60 * 24 * 30));
                
                // ✅ ALSO return token in response body for fallback auth via Authorization header
                return new Response(JSON.stringify({ 
                    success: true,
                    token: token,  // ← Token in body for Authorization header
                    user: { id: user.id, email: user.email, role } 
                }), { status: 200, headers });
            } else {
                return await handleFailure(user, "User");
            }
        }

        // Simplified Staff authentication
        const staff = await prisma.staff.findUnique({
            where: { email: normalizedEmail },
            include: { wedding: { select: { id: true } } },
        });

        if (staff && staff.password) {
            let isPasswordValid = await CryptoUtils.compare(password, staff.password);

            if (isPasswordValid) {
                if (staff.twoFactorEnabled) {
                    const configuredSecret = staff.twoFactorSecret;
                    if (!configuredSecret) {
                        console.error(`[Auth] Staff ${staff.id} has 2FA enabled without a configured secret.`);
                        return Response.json(
                            { error: "Two-factor authentication is misconfigured. Please contact support." },
                            { status: 503 }
                        );
                    }
                    if (typeof twoFactorToken !== "string" || !twoFactorToken.trim()) {
                        return corsJsonResponse({ require2FA: true, error: "2FA Token required" }, 428, req);
                    }
                    const suppliedToken = twoFactorToken.trim();
                    const secret = await decryptAndMigrateTotpSecret(
                        configuredSecret,
                        encryptedSecret => prisma.staff.update({
                            where: { id: staff.id },
                            data: { twoFactorSecret: encryptedSecret },
                        }),
                    );
                    let is2faValid = /^\d{6}$/.test(suppliedToken) &&
                        authenticator.check(suppliedToken, secret);
                    if (!is2faValid) {
                        is2faValid = await consumeRecoveryCode(
                            staff.twoFactorRecoveryCodes,
                            suppliedToken,
                            async (replacement, expected) => {
                                const update = await prisma.staff.updateMany({
                                    where: { id: staff.id, twoFactorRecoveryCodes: expected },
                                    data: { twoFactorRecoveryCodes: replacement },
                                });
                                return update.count === 1;
                            },
                        );
                    }
                    if (!is2faValid) {
                        return await handleFailure(staff, "Staff", "លេខកូដសុវត្ថិភាពមិនត្រឹមត្រូវ");
                    }
                }

                // Reset failure count
                await prisma.staff.update({ 
                    where: { id: staff.id }, 
                    data: { failedAttempts: 0, lockedUntil: null } 
                });

                const fingerprint = await generateFingerprint({ headers: req.headers, ip });
                const token = await signToken({ 
                    staffId: staff.id, 
                    weddingId: staff.weddingId, 
                    role: ROLES.EVENT_STAFF, 
                    name: staff.name 
                }, { fingerprint, expiresIn: "12h" });
                
                const origin = req.headers.get('origin') || 'https://moneoez.com';
                const headers = new Headers({ 
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": origin,
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CSRF-Token",
                    "Cache-Control": "no-store",
                });
                headers.append("Set-Cookie", getCookieHeader("staff_token", token, req, 60 * 60 * 12));
                return new Response(JSON.stringify({ 
                    success: true, 
                    user: { id: staff.id, email: staff.email, role: ROLES.EVENT_STAFF } 
                }), { status: 200, headers });
            } else {
                return await handleFailure(staff, "Staff");
            }
        }

        return await handleFailure(null, "User");

    } catch (error: any) {
        console.error("[Auth Signin] Error:", error);
        return corsJsonResponse({
            error: "Internal Server Error",
            message: "An unexpected error occurred during authentication.",
        }, 500, req);
    }
}
