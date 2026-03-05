export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
const { authenticator } = require("otplib");
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { SystemGovernance, GOVERNANCE_ACTIONS } from "@/lib/governance";

export async function POST(req: Request) {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

    let dbUser;
    if (user.type === "admin") {
        dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { twoFactorSecret: true, failedAttempts: true, lockedUntil: true } });
    } else {
        dbUser = await prisma.staff.findUnique({ where: { id: user.userId }, select: { twoFactorSecret: true, failedAttempts: true, lockedUntil: true } });
    }

    if (!dbUser || !dbUser.twoFactorSecret) {
        return NextResponse.json({ error: "2FA not setup" }, { status: 400 });
    }

    // Brute-force protection: Check if account is locked
    const now = new Date();
    if (dbUser.lockedUntil && dbUser.lockedUntil > now) {
        return NextResponse.json({ error: `គណនីផ្ទៀងផ្ទាត់ត្រូវបានចាក់សោរបណ្តោះអាសន្ន (Locked until ${dbUser.lockedUntil.toLocaleTimeString()})` }, { status: 423 });
    }

    const isValid = authenticator.verify({ token, secret: dbUser.twoFactorSecret });
    if (isValid) {
        if (user.type === "admin") {
            await prisma.user.update({ where: { id: user.userId }, data: { twoFactorEnabled: true, failedAttempts: 0, lockedUntil: null } });
        } else {
            await prisma.staff.update({ where: { id: user.userId }, data: { twoFactorEnabled: true, failedAttempts: 0, lockedUntil: null } });
        }

        const ip = req.headers.get("x-forwarded-for") || "unknown";
        await SystemGovernance.logAction(
            user.userId,
            user.email || "Unknown",
            GOVERNANCE_ACTIONS.ENABLE_2FA,
            { role: user.type, platform: "Authenticator" },
            ip,
            req.headers.get("user-agent") || "unknown"
        );

        return NextResponse.json({ success: true });
    }

    // Handle invalid token: Increment failed attempts
    const newAttempts = (dbUser.failedAttempts || 0) + 1;
    const lockTime = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

    if (user.type === "admin") {
        await prisma.user.update({ where: { id: user.userId }, data: { failedAttempts: newAttempts, lockedUntil: lockTime } });
    } else {
        await prisma.staff.update({ where: { id: user.userId }, data: { failedAttempts: newAttempts, lockedUntil: lockTime } });
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    await prisma.securityLog.create({
        data: { event: "2FA_VERIFY_FAILED", ip, email: user.email, details: `Failed 2FA verification attempt #${newAttempts}` }
    });

    return NextResponse.json({ error: "ការផ្ទៀងផ្ទាត់មិនត្រឹមត្រូវ (Invalid token)" }, { status: 400 });
}
