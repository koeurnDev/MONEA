import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'
import { prisma } from "@/lib/prisma"
import { getServerUser, signToken, generateFingerprint, isSecureCookie } from "@/lib/auth"
import { CryptoUtils } from "@/lib/crypto"
import { ROLES } from "@/lib/constants"
import { authLimiter } from "@/lib/ratelimit"
import { getIP } from "@/lib/utils"

const staffRouter = new Hono()

staffRouter.get('/verify-token', async (c) => {
    const token = c.req.query("token");

    if (!token) {
        return c.json({ error: "Token is required" }, 400);
    }

    const staff = await prisma.staff.findUnique({
        where: { accessToken: token } as any,
        include: { wedding: true }
    });

    if (!staff) {
        return c.json({ error: "Invalid or expired token" }, 404);
    }

    return c.json({
        valid: true,
        staff: {
            name: staff.name,
            weddingCode: (staff.wedding as any).weddingCode
        }
    });
});

staffRouter.post('/login', async (c) => {
    const otplib = await import("otplib") as any;
    try {
        const ip = getIP(c.req.raw as any);

        const isBlacklisted = await prisma.blacklistedIP.findUnique({ where: { ip } });
        if (isBlacklisted) {
            console.warn(`[Security] Blocked blacklisted IP from Staff Login: ${ip}`);
            return c.json({ error: "Access Denied" }, 403);
        }

        const { success: rlSuccess } = await authLimiter.limit(ip);
        if (!rlSuccess) {
            return c.json({ error: "Too many attempts. Please try again later." }, 429);
        }

        let body;
        try {
            body = await c.req.json();
        } catch {
            return c.json({ error: "Invalid JSON" }, 400);
        }
        const { email, password, pin, weddingCode, twoFactorToken } = body;

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
            if (checkStaff) {
                const attempts = checkStaff.failedAttempts + 1;
                const lockTime = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
                await prisma.staff.update({ where: { id: checkStaff.id }, data: { failedAttempts: attempts, lockedUntil: lockTime } });
            }
            return c.json({ error: "ព័ត៌មានមិនត្រឹមត្រូវ (Invalid information)" }, 401);
        }

        if (staffMember.twoFactorEnabled && staffMember.twoFactorSecret) {
            if (!twoFactorToken) return c.json({ require2FA: true }, 428);
            const verifyResult = await otplib.verify({
                token: twoFactorToken,
                secret: staffMember.twoFactorSecret,
                epochTolerance: 2
            });
            let is2faValid = verifyResult && verifyResult.valid;

            if (!is2faValid && staffMember.twoFactorRecoveryCodes) {
                const codes = JSON.parse(staffMember.twoFactorRecoveryCodes) as string[];
                const matchedIdx = (await Promise.all(codes.map(c => CryptoUtils.compare(twoFactorToken, c)))).findIndex(r => r === true);
                if (matchedIdx !== -1) {
                    is2faValid = true;
                    const updated = codes.filter((_, i) => i !== matchedIdx);
                    await prisma.staff.update({ where: { id: staffMember.id }, data: { twoFactorRecoveryCodes: JSON.stringify(updated) } });
                }
            }
            if (!is2faValid) return c.json({ error: "Invalid 2FA token" }, 401);
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
    const user = await getServerUser();
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    let wedding = await prisma.wedding.findFirst({
        where: { userId: user.userId || (user as any).id },
        include: { staff: true }
    });

    if (!wedding) {
        return c.json([]);
    }

    const staffToUpdate = wedding.staff.filter(s => !(s as any).accessToken);
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
        });
        return c.json({
            staff: updatedStaff,
            weddingCode: (wedding as any).weddingCode
        });
    }

    const sortedStaff = (wedding.staff as any[]).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({
        staff: sortedStaff,
        weddingCode: (wedding as any).weddingCode
    });
});

staffRouter.post('/', async (c) => {
    try {
        const user = await getServerUser();
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
        });

        return c.json(newStaff);
    } catch (e) {
        console.error("[API/Staff] POST Error:", e);
        return c.json({ error: "Internal Server Error", details: String(e) }, 500);
    }
});

staffRouter.delete('/', async (c) => {
    const user = await getServerUser();
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
