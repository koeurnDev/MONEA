export const dynamic = 'force-dynamic';
import { authenticator } from "@otplib/preset-default";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { SystemGovernance, GOVERNANCE_ACTIONS } from "@/lib/governance";

export async function POST(req: Request) {
    try {
        const user = await getServerUser(req);
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

        const { token } = await req.json();
        if (!token) return Response.json({ error: "Token required" }, { status: 400 });

        let dbUser: any;
        if (user.type === "admin") {
            dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { twoFactorSecret: true, failedAttempts: true, lockedUntil: true } });
        } else {
            dbUser = await prisma.staff.findUnique({ where: { id: user.userId }, select: { twoFactorSecret: true, failedAttempts: true, lockedUntil: true } });
        }

        if (!dbUser?.twoFactorSecret) return Response.json({ error: "2FA not setup" }, { status: 400 });

        // Brute-force protection
        if (dbUser.lockedUntil && dbUser.lockedUntil > new Date()) {
            return Response.json({ error: `គណនីផ្ទៀងផ្ទាត់ត្រូវបានចាក់សោ (Locked until ${dbUser.lockedUntil.toLocaleTimeString('km-KH', { timeZone: 'Asia/Phnom_Penh' })})` }, { status: 423 });
        }

        const isValid = authenticator.check(token, dbUser.twoFactorSecret);

        if (isValid) {
            if (user.type === "admin") {
                await prisma.user.update({ where: { id: user.userId }, data: { twoFactorEnabled: true, failedAttempts: 0, lockedUntil: null } });
            } else {
                await prisma.staff.update({ where: { id: user.userId }, data: { twoFactorEnabled: true, failedAttempts: 0, lockedUntil: null } });
            }

            const ip = req.headers.get("x-forwarded-for") || "unknown";
            await SystemGovernance.logAction(
                user.userId, user.email || "Unknown", GOVERNANCE_ACTIONS.ENABLE_2FA,
                { role: user.type, platform: "Authenticator" }, ip, req.headers.get("user-agent") || "unknown"
            );

            return Response.json({ success: true });
        }

        // Invalid token — increment failed attempts
        const newAttempts = (dbUser.failedAttempts || 0) + 1;
        const lockTime    = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

        if (user.type === "admin") {
            await prisma.user.update({ where: { id: user.userId }, data: { failedAttempts: newAttempts, lockedUntil: lockTime } });
        } else {
            await prisma.staff.update({ where: { id: user.userId }, data: { failedAttempts: newAttempts, lockedUntil: lockTime } });
        }

        const ip = req.headers.get("x-forwarded-for") || "unknown";
        await prisma.securityLog.create({
            data: { event: "TWOFA_VERIFY_FAILED", ip, email: user.email, details: `Failed 2FA attempt #${newAttempts}` }
        });

        return Response.json({ error: "ការផ្ទៀងផ្ទាត់មិនត្រឹមត្រូវ (Invalid token)" }, { status: 400 });
    } catch (error: any) {
        console.error("[2FA Verify]", error);
        return Response.json({ error: "Internal Server Error", details: error?.message || String(error) }, { status: 500 });
    }
}
