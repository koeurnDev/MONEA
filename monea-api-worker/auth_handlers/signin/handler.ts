export const dynamic = 'force-dynamic';
import { authenticator } from "@otplib/preset-default";
import { prisma } from "@/lib/prisma";
import { signToken, generateFingerprint, isSecureCookie, getCookieHeader } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { sendTelegramAlert } from "@/lib/telegram";
import { CryptoUtils } from "@/lib/crypto";
import { authLimiter, getIP } from "@/lib/ratelimit";

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
    // 1. Rate Limiting Check (Auth Tier)
    const ip = getIP(req);
    const { success, limit, reset, remaining } = await authLimiter.limit(ip);
    
    if (!success) {
        console.warn(`[RateLimit] Auth threshold exceeded for IP: ${ip}`);
        return Response.json(
            { error: "Too many login attempts. Please try again later." },
            { 
                status: 429,
                headers: {
                    "X-RateLimit-Limit": limit.toString(),
                    "X-RateLimit-Remaining": remaining.toString(),
                    "X-RateLimit-Reset": reset.toString(),
                }
            }
        );
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

        if (process.env.TURNSTILE_SECRET_KEY !== '1x0000000000000000000000000000000AA') {
            if (!turnstileToken) {
                return Response.json({ error: "សូមផ្ទៀងផ្ទាត់ CAPTCHA ដើម្បីបន្ត។" }, { status: 428 });
            }
            const formData = new URLSearchParams();
            formData.append('secret', process.env.TURNSTILE_SECRET_KEY || '');
            formData.append('response', turnstileToken);

            const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                body: formData,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });
            const turnstileResult = await verifyRes.json();

            if (!turnstileResult.success) {
                console.warn(`[Auth Signin] 400: Turnstile verification failed. Result: ${JSON.stringify(turnstileResult)}`);
                return Response.json({ error: "ការផ្ទៀងផ្ទាត់ CAPTCHA បរាជ័យ។ (CAPTCHA verification failed)" }, { status: 400 });
            }
        }

        // Check Blacklist & Persistent IP Security
        const isBlacklisted = await prisma.blacklistedIP.findUnique({ where: { ip } });
        if (isBlacklisted) {
            console.warn(`[Security] Blocked blacklisted IP: ${ip}`);
            return Response.json({ error: "ការចូលប្រើរបស់អ្នកត្រូវបានបិទជាបណ្តោះអាសន្ន។ (Access Denied)" }, { status: 403 });
        }

        const ipSecurity = await prisma.ipSecurity.findUnique({ where: { ip } });
        if (ipSecurity && ipSecurity.blockedUntil && ipSecurity.blockedUntil > new Date()) {
            return Response.json({ error: "Too many failed attempts from this IP. Blocked temporarily." }, { status: 429 });
        }

        // Helper: Handle Failed Logs & Progressive Delay
        const handleFailure = async (account: any, type: "User" | "Staff", customError?: string) => {
            const newAttempts = account ? account.failedAttempts + 1 : 1;
            const lockTime = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

            if (account) {
                const updateData = { failedAttempts: newAttempts, lockedUntil: lockTime };
                if (type === "User") await prisma.user.update({ where: { id: account.id }, data: updateData });
                else await prisma.staff.update({ where: { id: account.id }, data: updateData });

                if (newAttempts === 5) {
                    sendTelegramAlert(`🚨 *SECURITY ALERT*...`).catch(console.error);
                }
            }

            const ipRecord = await prisma.ipSecurity.upsert({
                where: { ip },
                update: { failures: { increment: 1 }, lastAttempt: new Date() },
                create: { ip, failures: 1 }
            });

            if (ipRecord.failures >= 10) {
                await prisma.ipSecurity.update({ where: { ip }, data: { blockedUntil: new Date(Date.now() + 30 * 60 * 1000) } });
            }

            await prisma.securityLog.create({
                data: { event: "LOGIN_FAILED", ip, geoIp, userAgent, email: normalizedEmail, details: account ? `${type} failed attempt (#${newAttempts})${customError ? `: ${customError}` : ''}` : `Account not found` }
            });

            const delayMs = Math.min((Math.pow(2, newAttempts) * 250), 8000);
            await new Promise(r => setTimeout(r, delayMs));

            return Response.json({ error: customError || "អ៊ីមែល ឬ ពាក្យសម្ងាត់មិនត្រឹមត្រូវ (Invalid Credentials)" }, { status: 401 });
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
                if ((user as any).twoFactorEnabled && (user as any).twoFactorSecret) {
                    if (!twoFactorToken) return Response.json({ require2FA: true, error: "2FA Token required" }, { status: 428 });

                    let is2faValid = authenticator.check(twoFactorToken, (user as any).twoFactorSecret);

                    if (!is2faValid && (user as any).twoFactorRecoveryCodes) {
                        const recoveryCodes = JSON.parse((user as any).twoFactorRecoveryCodes) as string[];
                        const matchedIndex = (await Promise.all(
                            recoveryCodes.map(hashed => CryptoUtils.compare(twoFactorToken, hashed))
                        )).findIndex(result => result === true);

                        if (matchedIndex !== -1) {
                            is2faValid = true;
                            const updatedCodes = recoveryCodes.filter((_, i) => i !== matchedIndex);
                            await (prisma.user.update as any)({
                                where: { id: user.id },
                                data: { twoFactorRecoveryCodes: JSON.stringify(updatedCodes) }
                            });
                        }
                    }

                    if (!is2faValid) {
                        return await handleFailure(user, "User", "លេខកូដសុវត្ថិភាពមិនត្រឹមត្រូវ (Invalid 2FA token)");
                    }
                }

                await prisma.user.update({ where: { id: user.id }, data: { failedAttempts: 0, lockedUntil: null } });
                if (ipSecurity) await prisma.ipSecurity.update({ where: { ip }, data: { failures: 0, blockedUntil: null } });

                await prisma.securityLog.create({ data: { event: "LOGIN_SUCCESS", ip, geoIp, userAgent, email: normalizedEmail, details: "User authentication successful" } });

                const role = user.role?.toUpperCase() || ROLES.EVENT_MANAGER;
                if (role === ROLES.PLATFORM_OWNER) {
                    sendTelegramAlert(
                        `🔔 *Superadmin Login Detected*\n\n` +
                        `👤 *Email:* ${user.email}\n` +
                        `🌐 *IP:* ${ip}\n` +
                        `📍 *Location:* ${geoIp || "Unknown"}\n` +
                        `📱 *Device:* ${userAgent?.substring(0, 50)}...\n` +
                        `⏰ *Time:* ${new Date().toLocaleString('km-KH', { timeZone: 'Asia/Phnom_Penh' })}`
                    ).catch(err => console.error("Failed to send login alert:", err));
                }

                const fingerprint = await generateFingerprint({ headers: req.headers, ip });
                const token = await signToken({ userId: user.id, email: user.email, role }, { fingerprint, expiresIn: "30d" });

                const headers = new Headers({ "Content-Type": "application/json" });
                headers.append("Set-Cookie", getCookieHeader("token", token, req, 60 * 60 * 24 * 30));
                return new Response(JSON.stringify({ success: true, token, user: { id: user.id, email: user.email, role } }), { status: 200, headers });
            } else {
                return await handleFailure(user, "User");
            }
        }

        // 2. Check STAFF
        const staff = await prisma.staff.findUnique({
            where: { email: normalizedEmail },
            include: { 
                wedding: {
                    include: {
                        user: {
                            select: { deletedAt: true }
                        }
                    }
                } 
            },
        });

        if (staff && staff.wedding?.user?.deletedAt) {
            return Response.json({ 
                error: "គណនីមង្គលការនេះត្រូវបានផ្អាកជាបណ្ដោះអាសន្ន។",
                details: "សូមទាក់ទងម្ចាស់គណនីមង្គលការរបស់អ្នក។"
            }, { status: 403 });
        }

        if (staff && staff.lockedUntil && staff.lockedUntil > new Date()) {
            return Response.json({ error: `គណនីចាក់សោរបណ្តោះអាសន្ន (Locked until ${staff.lockedUntil.toLocaleTimeString('km-KH', { timeZone: 'Asia/Phnom_Penh' })})` }, { status: 423 });
        }

        if (staff && staff.password) {
            let isPasswordValid = await CryptoUtils.compare(password, staff.password);

            if (isPasswordValid && CryptoUtils.isLegacy(staff.password)) {
                const newHash = await CryptoUtils.hash(password);
                await prisma.staff.update({ where: { id: staff.id }, data: { password: newHash } });
                console.log(`[Security] Staff ${staff.id} migrated to PBKDF2.`);
            }

            if (isPasswordValid) {
                if ((staff as any).twoFactorEnabled && (staff as any).twoFactorSecret) {
                    if (!twoFactorToken) return Response.json({ require2FA: true, error: "2FA Token required" }, { status: 428 });

                    // FIXED: (staff as any).twoFactorSecret instead of (user as any)
                    let is2faValid = authenticator.check(twoFactorToken, (staff as any).twoFactorSecret);

                    if (!is2faValid && (staff as any).twoFactorRecoveryCodes) {
                        const recoveryCodes = JSON.parse((staff as any).twoFactorRecoveryCodes) as string[];
                        const matchedIndex = (await Promise.all(
                            recoveryCodes.map(hashed => CryptoUtils.compare(twoFactorToken, hashed))
                        )).findIndex(result => result === true);

                        if (matchedIndex !== -1) {
                            is2faValid = true;
                            const updatedCodes = recoveryCodes.filter((_, i) => i !== matchedIndex);
                            await (prisma.staff.update as any)({
                                where: { id: staff.id },
                                data: { twoFactorRecoveryCodes: JSON.stringify(updatedCodes) }
                            });
                        }
                    }

                    if (!is2faValid) {
                        return await handleFailure(staff, "Staff", "លេខកូដសុវត្ថិភាពមិនត្រឹមត្រូវ (Invalid 2FA token)");
                    }
                }

                await prisma.staff.update({ where: { id: staff.id }, data: { failedAttempts: 0, lockedUntil: null } });
                if (ipSecurity) await prisma.ipSecurity.update({ where: { ip }, data: { failures: 0, blockedUntil: null } });

                await prisma.securityLog.create({ data: { event: "LOGIN_SUCCESS", ip, geoIp, userAgent, email: normalizedEmail, details: "Staff authentication successful" } });

                const fingerprint = await generateFingerprint({ headers: req.headers, ip });
                const token = await signToken({ staffId: staff.id, weddingId: staff.weddingId, role: ROLES.EVENT_STAFF, name: staff.name }, { fingerprint, expiresIn: "12h" });
                
                const headers = new Headers({ "Content-Type": "application/json" });
                headers.append("Set-Cookie", getCookieHeader("staff_token", token, req, 60 * 60 * 12));
                return new Response(JSON.stringify({ success: true, token, user: { id: staff.id, email: staff.email, role: ROLES.EVENT_STAFF } }), { status: 200, headers });
            } else {
                return await handleFailure(staff, "Staff");
            }
        }

        return await handleFailure(null, "User");

    } catch (error: any) {
        console.error("[Auth Signin] Error:", error);
        return Response.json({
            error: "Internal Server Error",
            message: "An unexpected error occurred during authentication."
        }, { status: 500 });
    }
}