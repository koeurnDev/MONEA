export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { CryptoUtils } from "@/lib/crypto";
import { SystemGovernance, GOVERNANCE_ACTIONS } from "@/lib/governance";

export async function POST(req: Request) {
    try {
        const user = await getServerUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { password } = await req.json();
        if (!password) {
            return NextResponse.json({ error: "Password verification required to disable 2FA" }, { status: 400 });
        }

        // Security: Verify password before disabling 2FA
        let dbUser;
        if (user.type === "admin") {
            dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { password: true, email: true } });
        } else {
            dbUser = await prisma.staff.findUnique({ where: { id: user.userId }, select: { password: true, email: true } });
        }

        if (!dbUser || !dbUser.password || !(await CryptoUtils.compare(password, dbUser.password))) {
            return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        }

        // Disable 2FA in Database
        if (user.type === "admin") {
            await prisma.user.update({
                where: { id: user.userId },
                data: {
                    twoFactorEnabled: false,
                    twoFactorSecret: null,
                    twoFactorRecoveryCodes: null
                }
            });
        } else {
            await prisma.staff.update({
                where: { id: user.userId },
                data: {
                    twoFactorEnabled: false,
                    twoFactorSecret: null,
                    twoFactorRecoveryCodes: null
                }
            });
        }

        const ip = req.headers.get("x-forwarded-for") || "unknown";
        const userAgent = req.headers.get("user-agent") || "unknown";

        // Governance Logging
        await SystemGovernance.logAction(
            user.userId,
            user.email || dbUser.email || "Unknown",
            GOVERNANCE_ACTIONS.DISABLE_2FA,
            { role: user.type },
            ip,
            userAgent
        );

        // Security Logging
        await prisma.securityLog.create({
            data: {
                event: "TWOFA_DISABLED",
                ip,
                email: user.email || dbUser.email,
                details: `2FA disabled by user`
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("2FA Disable Error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error?.message || String(error)
        }, { status: 500 });
    }
}
