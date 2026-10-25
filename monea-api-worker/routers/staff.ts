import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'
import { prisma } from "@/lib/prisma"
import { getServerUser, signToken, generateFingerprint, isSecureCookie } from "@/lib/auth"
import { CryptoUtils } from "@/lib/crypto"
import { ROLES } from "@/lib/constants"
import { authLimiter } from "@/lib/ratelimit"
import { getIP } from "@/lib/utils"
import { decryptAndMigrateTotpSecret } from "@/lib/totp-secret"
import { incrementLoginFailureCounter } from "@/lib/login-failure-counter"
import { isRecord, readJsonBodyLimited } from "@/lib/read-json-body-limited"

const staffRouter = new Hono()
const MAX_STAFF_LOGIN_BODY_BYTES = 16_384

const staffResponseFields = {
    id: true,
    name: true,
    email: true,
    role: true,
    weddingId: true,
    createdAt: true,
} as const

async function consumeStaffRecoveryCode(
    staffId: string,
    storedCodes: string | null,
    candidate: string,
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
        if (!(await CryptoUtils.compare(candidate, hashes[index]))) continue;

        const replacement = JSON.stringify(hashes.filter((_, codeIndex) => codeIndex !== index));
        const update = await prisma.staff.updateMany({
            where: { id: staffId, twoFactorRecoveryCodes: storedCodes },
            data: { twoFactorRecoveryCodes: replacement },
        });
        return update.count === 1;
    }
    return false;
}

async function recordStaffLoginFailure(
    staff: { id: string } | null,
    ip: string,
    headers: Headers,
): Promise<void> {
    if (staff) {
        try {
            await incrementLoginFailureCounter(
                async () => (await prisma.staff.findUnique({
                    where: { id: staff.id },
                    select: { failedAttempts: true },
                }))?.failedAttempts ?? null,
                async (expected, next, lockedUntil) => {
                    const result = await prisma.staff.updateMany({
                        where: { id: staff.id, failedAttempts: expected },
                        data: { failedAttempts: next, lockedUntil },
                    });
                    return result.count === 1;
                },
            );
        } catch (error) {
            console.error("[Auth] Failed to update staff sign-in failure count:", error);
        }
    }

    try {
        await prisma.securityLog.create({
            data: {
                event: "LOGIN_FAILED",
                ip,
                geoIp: headers.get("x-vercel-ip-country") || headers.get("cf-ipcountry") || "UNKNOWN",
                userAgent: headers.get("user-agent") || "UNKNOWN",
                details: "Staff authentication failed",
            },
        });
    } catch (error) {
        console.error("[Auth] Failed to record staff sign-in failure:", error);
    }
}

staffRouter.get('/verify-token', async (c) => {
    const token = c.req.query("token");

    if (!token) {
        return c.json({ error: "Token is required" }, 400);
    }

    const staff = await prisma.staff.findUnique({
        where: { accessToken: token } as any,
        select: {
            name: true,
            wedding: { select: { weddingCode: true } },
        }
    });

    if (!staff) {
        return c.json({ error: "Invalid or expired token" }, 404);
    }

    return c.json({
        valid: true,
        staff: {
            name: staff.name,
            weddingCode: staff.wedding.weddingCode
        }
    });
});

staffRouter.post('/login', async (c) => {
    const otplib = await import("otplib") as any;
    try {
        const ip = getIP(c.req.raw as any);
        const isProduction = process.env.NODE_ENV === "production" || process.env.ENVIRONMENT === "production";
        if (isProduction && ip === "unknown") {
            console.error("[Security] Staff sign-in rejected because the trusted client IP is unavailable.");
            return c.json({ error: "Sign-in is temporarily unavailable. Please try again later." }, 503);
        }

        let isBlacklisted;
        try {
            isBlacklisted = await prisma.blacklistedIP.findUnique({ where: { ip } });
        } catch (error) {
            console.error("[Security] Staff sign-in IP blacklist check failed; rejecting request.", error);
            return c.json({ error: "Sign-in is temporarily unavailable. Please try again later." }, 503);
        }
        if (isBlacklisted) {
            console.warn(`[Security] Blocked blacklisted IP from Staff Login: ${ip}`);
            return c.json({ error: "Access Denied" }, 403);
        }

        let rlSuccess: boolean;
        try {
            ({ success: rlSuccess } = await authLimiter.limit(ip));
        } catch (error) {
            console.error("[RateLimit] Staff sign-in protection unavailable; rejecting request.", error);
            return c.json({ error: "Sign-in is temporarily unavailable. Please try again later." }, 503);
        }
        if (!rlSuccess) {
            return c.json({ error: "Too many attempts. Please try again later." }, 429);
        }

        const parsedBody = await readJsonBodyLimited(c.req.raw, MAX_STAFF_LOGIN_BODY_BYTES)
        if (parsedBody.kind === "too_large") {
            return c.json({ error: "Request body is too large" }, 413)
        }
        if (parsedBody.kind === "invalid" || !isRecord(parsedBody.value)) {
            return c.json({ error: "Invalid JSON" }, 400);
        }
        const body = parsedBody.value
        const { email, password, pin, weddingCode, twoFactorToken } = body;
        if (
            (email !== undefined && (typeof email !== "string" || email.length > 254)) ||
            (password !== undefined && (typeof password !== "string" || password.length > 128)) ||
            (pin !== undefined && (typeof pin !== "string" || pin.length > 128)) ||
            (weddingCode !== undefined && (typeof weddingCode !== "string" || weddingCode.length > 64)) ||
            (twoFactorToken !== undefined && (typeof twoFactorToken !== "string" || twoFactorToken.length > 10))
        ) {
            return c.json({ error: "Invalid request body" }, 400)
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        let staffMember = null;

        const checkStaff = await prisma.staff.findFirst({
            where: {
                OR: [
                    { email: email || "" },
                    { wedding: { weddingCode: (weddingCode || "").replace("#", "").toUpperCase() } }
                ]
            },
            include: { wedding: true }
        });

        if (checkStaff) {
            if (checkStaff.lockedUntil && checkStaff.lockedUntil > new Date()) {
                return c.json({ error: "Account locked temporarily." }, 423);
            }

            if (email && password && checkStaff.password) {
                let isValid = await CryptoUtils.compare(password, checkStaff.password);
                if (isValid && CryptoUtils.isLegacy(checkStaff.password)) {
                    const newHash = await CryptoUtils.hash(password);
                    await prisma.staff.update({ where: { id: checkStaff.id }, data: { password: newHash } });
                }
                if (isValid) staffMember = checkStaff;
            } else if (weddingCode && pin && checkStaff.pin) {
                let isValid = await CryptoUtils.compare(pin, checkStaff.pin);
                if (isValid && CryptoUtils.isLegacy(checkStaff.pin)) {
                    const newHash = await CryptoUtils.hash(pin);
                    await prisma.staff.update({ where: { id: checkStaff.id }, data: { pin: newHash } });
                }
                if (isValid) staffMember = checkStaff;
            }
        }

        if (!staffMember) {
            await recordStaffLoginFailure(checkStaff, ip, c.req.raw.headers);
            return c.json({ error: "ព័ត៌មានមិនត្រឹមត្រូវ (Invalid information)" }, 401);
        }

        if (staffMember.twoFactorEnabled) {
            if (!staffMember.twoFactorSecret) {
                console.error(`[Auth] Staff ${staffMember.id} has 2FA enabled without a configured secret.`);
                return c.json({ error: "Two-factor authentication is misconfigured. Please contact support." }, 503);
            }
            if (typeof twoFactorToken !== "string" || !twoFactorToken.trim()) {
                return c.json({ require2FA: true }, 428);
            }
            const suppliedToken = twoFactorToken.trim();
            const secret = await decryptAndMigrateTotpSecret(
                staffMember.twoFactorSecret,
                encryptedSecret => prisma.staff.update({
                    where: { id: staffMember.id },
                    data: { twoFactorSecret: encryptedSecret },
                }),
            );
            const verifyResult = /^\d{6}$/.test(suppliedToken)
                ? await otplib.verify({
                    token: suppliedToken,
                    secret,
                    epochTolerance: 2
                })
                : { valid: false };
            let is2faValid = Boolean(verifyResult?.valid);

            if (!is2faValid) {
                is2faValid = await consumeStaffRecoveryCode(
                    staffMember.id,
                    staffMember.twoFactorRecoveryCodes,
                    suppliedToken,
                );
            }
            if (!is2faValid) {
                await recordStaffLoginFailure(staffMember, ip, c.req.raw.headers);
                return c.json({ error: "Invalid 2FA token" }, 401);
            }
        }

        await prisma.staff.update({ where: { id: staffMember.id }, data: { failedAttempts: 0, lockedUntil: null } });

        const fingerprint = await generateFingerprint({ headers: c.req.raw.headers, ip });
        const token = await signToken({
            staffId: staffMember.id,
            weddingId: staffMember.weddingId,
            role: ROLES.EVENT_STAFF,
            name: staffMember.name
        }, { fingerprint, expiresIn: "12h" });

        const cookieSecure = isSecureCookie(c.req.raw as any);

        setCookie(c, "staff_token", token, {
            httpOnly: true,
            secure: cookieSecure,
            maxAge: 60 * 60 * 12,
            path: "/",
            sameSite: "lax"
        });

        return c.json({ success: true });
    } catch (error) {
        console.error("Staff Login Error:", error);
        return c.json({ error: "Server Error" }, 500);
    }
});

staffRouter.get('/', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const wedding = await prisma.wedding.findFirst({
        where: { userId: user.userId || (user as any).id },
        select: { id: true, weddingCode: true },
    });

    if (!wedding) {
        return c.json([]);
    }

    const staffForTokenCheck = await prisma.staff.findMany({
        where: { weddingId: wedding.id },
        select: { id: true, accessToken: true },
    });
    const staffToUpdate = staffForTokenCheck.filter(s => !s.accessToken);
    if (staffToUpdate.length > 0) {
        for (const s of staffToUpdate) {
            await prisma.staff.update({
                where: { id: s.id },
                data: { accessToken: crypto.randomUUID() }
            });
        }
        const updatedStaff = await prisma.staff.findMany({
            where: { weddingId: wedding.id },
            orderBy: { createdAt: "desc" },
            select: staffResponseFields,
        });
        return c.json({
            staff: updatedStaff,
            weddingCode: wedding.weddingCode
        });
    }

    const sortedStaff = await prisma.staff.findMany({
        where: { weddingId: wedding.id },
        orderBy: { createdAt: "desc" },
        select: staffResponseFields,
    });

    return c.json({
        staff: sortedStaff,
        weddingCode: wedding.weddingCode
    });
});

staffRouter.post('/', async (c) => {
    try {
        const user = await getServerUser(c.req.raw);
        if (!user) return c.json({ error: "Unauthorized" }, 401);

        let wedding = await prisma.wedding.findFirst({
            where: { userId: user.userId || (user as any).id },
        });

        if (!wedding) {
            return c.json({ error: "សូមបង្កើតព័ត៌មានមង្គលការជាមុនសិន (Please create a wedding profile first)" }, 403);
        }

        let body;
        try {
            body = await c.req.json();
        } catch {
            return c.json({ error: "Invalid JSON" }, 400);
        }
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return c.json({ error: "សូមបញ្ចូល ឈ្មោះ, អ៊ីមែល និង ពាក្យសម្ងាត់" }, 400);
        }

        const existingStaff = await prisma.staff.findUnique({
            where: { email }
        });

        if (existingStaff) {
            return c.json({
                error: "អ៊ីមែលនេះមានប្រើរួចហើយ",
                details: "Email already in use."
            }, 400);
        }

        const hashedPassword = await CryptoUtils.hash(password);
        const accessToken = crypto.randomUUID();

        const newStaff = await prisma.staff.create({
            data: {
                name,
                email,
                password: hashedPassword,
                weddingId: wedding.id,
                role: "STAFF",
                accessToken,
                pin: null,
            },
            select: staffResponseFields,
        });

        return c.json(newStaff);
    } catch (e) {
        console.error("[API/Staff] POST Error:", e);
        return c.json({ error: "Internal Server Error", details: String(e) }, 500);
    }
});

staffRouter.delete('/', async (c) => {
    const user = await getServerUser(c.req.raw);
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const id = c.req.query("id");
    if (!id) return c.json({ error: "ID is required" }, 400);

    const wedding = await prisma.wedding.findFirst({
        where: { userId: user.userId || (user as any).id },
    });

    if (!wedding) return c.json({ error: "Wedding not found" }, 404);

    const count = await prisma.staff.count({
        where: { id, weddingId: wedding.id },
    });

    if (count === 0) {
        return c.json({ error: "Staff not found or access denied" }, 404);
    }

    await prisma.staff.delete({
        where: { id },
    });

    return c.json({ success: true });
});

export default staffRouter;
