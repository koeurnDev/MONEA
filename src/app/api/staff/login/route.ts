export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, generateFingerprint } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { ROLES } from "@/lib/constants";
import { CryptoUtils } from "@/lib/crypto";
// const { authenticator } = require("otplib"); - Dynamic import used inside POST for ESM compatibility

const rateLimit = new Map<string, { count: number, lastAttempt: number }>();

export async function POST(req: Request) {
    const { authenticator } = await import("otplib") as any;
    try {
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        const userAgent = req.headers.get("user-agent") || "unknown";

        // Check Blacklist
        const isBlacklisted = await prisma.blacklistedIP.findUnique({ where: { ip } });
        if (isBlacklisted) {
            console.warn(`[Security] Blocked blacklisted IP from Staff Login: ${ip}`);
            return NextResponse.json({ error: "Access Denied" }, { status: 403 });
        }

        const now = Date.now();
        const limit = rateLimit.get(ip);
        if (limit) {
            if (now - limit.lastAttempt < 60 * 1000) {
                if (limit.count >= 5) return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
            } else {
                rateLimit.set(ip, { count: 0, lastAttempt: now });
            }
        }

        const body = await req.json();
        const { email, password, pin, weddingCode, twoFactorToken } = body;

        await new Promise(resolve => setTimeout(resolve, 500));

        let staffMember = null;

        // 1. Identify Staff Member
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
                return NextResponse.json({ error: "Account locked temporarily." }, { status: 423 });
            }

            // Auth Logic
            if (email && password && checkStaff.password) {
                let isValid = await CryptoUtils.compare(password, checkStaff.password);
                if (!isValid) {
                    isValid = await bcrypt.compare(password, checkStaff.password);
                    if (isValid) {
                        const peppered = await CryptoUtils.hash(password);
                        await prisma.staff.update({ where: { id: checkStaff.id }, data: { password: peppered } });
                    }
                }
                if (isValid) staffMember = checkStaff;
            } else if (weddingCode && pin && checkStaff.pin) {
                let isValid = await CryptoUtils.compare(pin, checkStaff.pin);
                if (!isValid) {
                    isValid = await bcrypt.compare(pin, checkStaff.pin);
                    if (isValid) {
                        const peppered = await CryptoUtils.hash(pin);
                        await prisma.staff.update({ where: { id: checkStaff.id }, data: { pin: peppered } });
                    }
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
            const current = rateLimit.get(ip) || { count: 0, lastAttempt: now };
            rateLimit.set(ip, { count: current.count + 1, lastAttempt: now });
            return NextResponse.json({ error: "ព័ត៌មានមិនត្រឹមត្រូវ (Invalid information)" }, { status: 401 });
        }

        // 2. 2FA Check
        if (staffMember.twoFactorEnabled && staffMember.twoFactorSecret) {
            if (!twoFactorToken) return NextResponse.json({ require2FA: true }, { status: 428 });
            let is2faValid = authenticator.verify({ token: twoFactorToken, secret: staffMember.twoFactorSecret });

            if (!is2faValid && staffMember.twoFactorRecoveryCodes) {
                const codes = JSON.parse(staffMember.twoFactorRecoveryCodes) as string[];
                const matchedIdx = (await Promise.all(codes.map(c => CryptoUtils.compare(twoFactorToken, c)))).findIndex(r => r === true);
                if (matchedIdx !== -1) {
                    is2faValid = true;
                    const updated = codes.filter((_, i) => i !== matchedIdx);
                    await prisma.staff.update({ where: { id: staffMember.id }, data: { twoFactorRecoveryCodes: JSON.stringify(updated) } });
                }
            }
            if (!is2faValid) return NextResponse.json({ error: "Invalid 2FA token" }, { status: 401 });
        }

        // 3. Success
        rateLimit.delete(ip);
        await prisma.staff.update({ where: { id: staffMember.id }, data: { failedAttempts: 0, lockedUntil: null } });

        const fingerprint = generateFingerprint({ headers: req.headers, ip });
        const token = signToken({
            staffId: staffMember.id,
            weddingId: staffMember.weddingId,
            role: ROLES.EVENT_STAFF,
            name: staffMember.name
        }, { fingerprint, expiresIn: "12h" });

        const response = NextResponse.json({ success: true });
        response.cookies.set("staff_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 12,
            path: "/",
            sameSite: "lax"
        });
        return response;

    } catch (error) {
        console.error("Staff Login Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
