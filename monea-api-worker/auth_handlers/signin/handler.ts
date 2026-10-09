export const dynamic = 'force-dynamic';
import { authenticator } from "@otplib/preset-default";
import { prisma } from "@/lib/prisma";
import { signToken, generateFingerprint, isSecureCookie, getCookieHeader } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { sendTelegramAlert } from "@/lib/telegram";
import { CryptoUtils } from "@/lib/crypto";
import { authLimiter, getIP } from "@/lib/ratelimit";
import { verifyTurnstileDetailed } from "@/lib/turnstile";
import { decryptAndMigrateTotpSecret } from "@/lib/totp-secret";

export async function OPTIONS(req: Request) {
    const origin = req.headers.get("origin") || "*";
    const response = new Response(null, { status: 204 });
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
}

export async function POST(req: Request) {
    // Rate limiting
    const ip = getIP(req);
    let rateLimit: Awaited<ReturnType<typeof authLimiter.limitStrict>>;
    try {
        rateLimit = await authLimiter.limitStrict(ip);
    } catch {
        console.error("[RateLimit] Distributed sign-in protection unavailable; rejecting request.");
        return Response.json(
            { error: "Sign-in is temporarily unavailable. Please try again later." },
            { status: 503 }
        );
    }

    if (!rateLimit.success) {
        console.warn(`[RateLimit] Auth threshold exceeded for IP: ${ip}`);
        return Response.json({ error: "Too many login attempts. Please try again later." }, { status: 429 });
    }

    try {
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return Response.json({ error: "Invalid request body" }, { status: 400 });
        }

        const { email, password, turnstileToken, twoFactorToken } = body;
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : email;

        // Standardized IP Detection
        const geoIp = req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || "UNKNOWN";
        const userAgent = req.headers.get("user-agent") || "UNKNOWN";

        // Turnstile CAPTCHA verification
        const isProduction = process.env.NODE_ENV === 'production' || process.env.ENVIRONMENT === 'production';
        const TEST_TURNSTILE_SECRET = '1x0000000000000000000000000000000AA';
        const turnstileSecret = process.env.TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET;
        const turnstileBypassedForDev = !isProduction && !turnstileSecret;

        if (!turnstileBypassedForDev) {
            if (!turnstileSecret || turnstileSecret === TEST_TURNSTILE_SECRET) {
                console.error(
                    '[Turnstile] CRITICAL: TURNSTILE_SECRET_KEY is missing or set to the always-pass test key. Refusing to authenticate.'
                );
                return Response.json(
                    { error: "សេវាផ្ទៀងផ្ទាត់ CAPTCHA មិនអាចប្រើប្រាស់បានទេ។ សូមព្យាយាមម្ដងទៀត។" },
                    { status: 503 }
                );
            }

            if (!turnstileToken || typeof turnstileToken !== 'string') {
                return Response.json({ error: "សូមផ្ទៀងផ្ទាត់ CAPTCHA ដើម្បីបន្ត។" }, { status: 428 });
            }

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

        // Simplified IP security checks
        try {
            const isBlacklisted = await prisma.blacklistedIP.findUnique({ where: { ip } });
            if (isBlacklisted) {
                return Response.json({ error: "ការចូលប្រើរបស់អ្នកត្រូវបានបិទជាបណ្តោះអាសន្ន។" }, { status: 403 });
            }
        } catch (e) {
            console.warn('[Security] IP check failed, continuing...', e);
        }

        // Simplified failure handler for better performance
        const handleFailure = async (account: any, type: "User" | "Staff", customError?: string) => {
            try {
                if (account) {
                    const newAttempts = account.failedAttempts + 1;
                    const lockTime = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
                    const updateData = { failedAttempts: newAttempts, lockedUntil: lockTime };
                    
                    if (type === "User") {
                        await prisma.user.update({ where: { id: account.id }, data: updateData });
                    } else {
                        await prisma.staff.update({ where: { id: account.id }, data: updateData });
                    }
                }
            } catch (e) {
                console.warn('[Auth] Failed to update failure count:', e);
            }

            // Reduced delay for better UX
            await new Promise(r => setTimeout(r, 500));
            return Response.json({ error: customError || "អ៊ីមែល ឬ ពាក្យសម្ងាត់មិនត្រឹមត្រូវ" }, { status: 401 });
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
            return Response.json({ 
                error: "គណនីនេះត្រូវបានលុបបណ្ដោះអាសន្ន។", 
                details: "គណនីរបស់អ្នកស្ថិតក្នុងអំឡុងពេល ៣០ ថ្ងៃនៃការលុប។ សូមទាក់ទងមកកាន់ពួកយើងបើលោកអ្នកចង់យកវាត្រឡប់មកវិញ voyage" 
            }, { status: 403 });
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
                // Simplified 2FA check
                if (user.twoFactorEnabled && user.twoFactorSecret) {
                    if (!twoFactorToken) {
                        return Response.json({ require2FA: true, error: "2FA Token required" }, { status: 428 });
                    }

                    const secret = await decryptAndMigrateTotpSecret(
                        user.twoFactorSecret,
                        encryptedSecret => prisma.user.update({
                            where: { id: user.id },
                            data: { twoFactorSecret: encryptedSecret },
                        }),
                    );
                    const is2faValid = authenticator.check(twoFactorToken, secret);
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
                            email: normalizedEmail, 
                            details: "User authentication successful" 
                        } 
                    });
                } catch (e) {
                    console.warn('[Auth] Failed to create security log:', e);
                }

                const role = user.role?.toUpperCase() || ROLES.EVENT_MANAGER;
                const fingerprint = await generateFingerprint({ headers: req.headers, ip });
                const token = await signToken({ userId: user.id, email: user.email, role }, { fingerprint, expiresIn: "30d" });

                const headers = new Headers({ "Content-Type": "application/json" });
                headers.append("Set-Cookie", getCookieHeader("token", token, req, 60 * 60 * 24 * 30));
                return new Response(JSON.stringify({ 
                    success: true, 
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
                // Simplified 2FA for staff
                if (staff.twoFactorEnabled && staff.twoFactorSecret) {
                    if (!twoFactorToken) {
                        return Response.json({ require2FA: true, error: "2FA Token required" }, { status: 428 });
                    }
                    const secret = await decryptAndMigrateTotpSecret(
                        staff.twoFactorSecret,
                        encryptedSecret => prisma.staff.update({
                            where: { id: staff.id },
                            data: { twoFactorSecret: encryptedSecret },
                        }),
                    );
                    const is2faValid = authenticator.check(twoFactorToken, secret);
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
                
                const headers = new Headers({ "Content-Type": "application/json" });
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
        return Response.json({
            error: "Internal Server Error",
            message: "An unexpected error occurred during authentication.",
        }, { status: 500 });
    }
}