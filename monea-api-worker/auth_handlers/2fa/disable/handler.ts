export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { CryptoUtils } from "@/lib/crypto";
import { SystemGovernance, GOVERNANCE_ACTIONS } from "@/lib/governance";
import { getIP } from "@/lib/utils";

export async function POST(req: Request) {
    try {
        // 1. Authenticate user passing Request context
        const user = await getServerUser(req);
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json().catch(() => ({}));
        const { password } = body;
        
        if (!password) {
            return Response.json({ error: "Password verification required to disable 2FA" }, { status: 400 });
        }

        // 2. Security Check: Verify user password
        let dbUser;
        if (user.type === "admin") {
            dbUser = await prisma.user.findUnique({ 
                where: { id: user.userId }, 
                select: { password: true, email: true } 
            });
        } else {
            dbUser = await prisma.staff.findUnique({ 
                where: { id: user.userId }, 
                select: { password: true, email: true } 
            });
        }

        if (!dbUser) {
            return Response.json({ error: "User account not found" }, { status: 404 });
        }

        // Handle SSO users who don't have a hashed password stored
        if (!dbUser.password) {
            return Response.json({ 
                error: "Password verification unavailable for SSO accounts. Please re-authenticate via SSO." 
            }, { status: 400 });
        }

        const isPasswordValid = await CryptoUtils.compare(password, dbUser.password);
        if (!isPasswordValid) {
            return Response.json({ error: "Invalid password" }, { status: 401 });
        }

        // 3. Disable 2FA in Database
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

        // 4. Extract Trusted Client Info
        const ip = getIP(req);
        const userAgent = req.headers.get("user-agent") || "unknown";

        // 5. Governance & Audit Logging
        await SystemGovernance.logAction(
            user.userId,
            user.email || dbUser.email || "Unknown",
            GOVERNANCE_ACTIONS.DISABLE_2FA,
            { role: user.type },
            ip,
            userAgent
        );

        // Security Audit Log
        await prisma.securityLog.create({
            data: {
                event: "TWOFA_DISABLED",
                ip,
                email: user.email || dbUser.email,
                details: `2FA disabled by user (${user.type})`
            }
        });

        return Response.json({ success: true, message: "2FA disabled successfully" });

    } catch (error: any) {
        console.error("[2FA Disable Error]:", error);
        return Response.json({
            error: "Internal Server Error",
            details: error?.message || String(error)
        }, { status: 500 });
    }
}