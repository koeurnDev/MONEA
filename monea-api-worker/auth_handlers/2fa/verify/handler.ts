export const dynamic = 'force-dynamic';
import { authenticator } from "@otplib/preset-default";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { SystemGovernance, GOVERNANCE_ACTIONS } from "@/lib/governance";
import { getIP, formatCambodiaDate } from "@/lib/utils";

// Configure TOTP tolerance (Window 1 allows +-30s clock drift)
authenticator.options = { window: 1 };

export async function POST(req: Request) {
    try {
        const user = await getServerUser(req);
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

        let token = "";
        try {
            const body = await req.json();
            token = body.token;
        } catch {
            return Response.json({ error: "Invalid JSON request body" }, { status: 400 });
        }

        if (!token) return Response.json({ error: "Token required" }, { status: 400 });

        // 1. Fetch User / Staff details
        let dbUser: any;
        if (user.type === "admin") {
            dbUser = await prisma.user.findUnique({ 
                where: { id: user.userId }, 
                select: { twoFactorSecret: true, failedAttempts: true, lockedUntil: true } 
            });
        } else {
            dbUser = await prisma.staff.findUnique({ 
                where: { id: user.userId }, 
                select: { twoFactorSecret: true, failedAttempts: true, lockedUntil: true } 
            });
        }

        if (!dbUser?.twoFactorSecret) {
            return Response.json({ error: "2FA is not set up yet" }, { status: 400 });
        }

        // 2. Brute-force protection check
        if (dbUser.lockedUntil && dbUser.lockedUntil > new Date()) {
            const timeStr = formatCambodiaDate(dbUser.lockedUntil, { hour: '2-digit', minute: '2-digit' });
            return Response.json({ 
                error: `គណនីផ្ទៀងផ្ទាត់ត្រូវបានចាក់សោ (Locked until ${timeStr})` 
            }, { status: 423 });
        }

        // 3. Verify TOTP Token
        const isValid = authenticator.check(token, dbUser.twoFactorSecret);
        const ip = getIP(req);
        const userAgent = req.headers.get("user-agent") || "unknown";

        if (isValid) {
            // Reset failure counters and enable 2FA
            if (user.type === "admin") {
                await prisma.user.update({ 
                    where: { id: user.userId }, 
                    data: { twoFactorEnabled: true, failedAttempts: 0, lockedUntil: null } 
                });
            } else {
                await prisma.staff.update({ 
                    where: { id: user.userId }, 
                    data: { twoFactorEnabled: true, failedAttempts: 0, lockedUntil: null } 
                });
            }

            // Audit Logging
            await SystemGovernance.logAction(
                user.userId, 
                user.email || "Unknown", 
                GOVERNANCE_ACTIONS.ENABLE_2FA,
                { role: user.type, platform: "Authenticator" }, 
                ip, 
                userAgent
            );

            return Response.json({ success: true, message: "2FA verified and enabled successfully" });
        }

        // 4. Invalid Token Handling (Increment failures & Lockout if threshold reached)
        const newAttempts = (dbUser.failedAttempts || 0) + 1;
        const lockTime = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

        if (user.type === "admin") {
            await prisma.user.update({ 
                where: { id: user.userId }, 
                data: { failedAttempts: newAttempts, lockedUntil: lockTime } 
            });
        } else {
            await prisma.staff.update({ 
                where: { id: user.userId }, 
                data: { failedAttempts: newAttempts, lockedUntil: lockTime } 
            });
        }

        // Security Audit Log
        await prisma.securityLog.create({
            data: { 
                event: "TWOFA_VERIFY_FAILED", 
                ip, 
                email: user.email, 
                details: `Failed 2FA attempt #${newAttempts}` 
            }
        });

        return Response.json({ error: "ការផ្ទៀងផ្ទាត់មិនត្រឹមត្រូវ (Invalid token)" }, { status: 400 });

    } catch (error: any) {
        console.error("[2FA Verify Error]:", error);
        return Response.json({ 
            error: "Internal Server Error", 
            details: error?.message || String(error) 
        }, { status: 500 });
    }
}