export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const user = await getServerUser();
        const body = await req.json();
        const { targetType, targetId } = body; // targetType: 'GLOBAL', 'STAFF', 'USER'

        // Authorized if:
        // 1. User is ADMIN/SUPERADMIN
        // 2. User is NOT admin but requesting 'SELF' revocation
        const isAuthorized = user && (
            (user.role === "SUPERADMIN" || user.role === "ADMIN") ||
            (targetType === "SELF")
        );

        if (!isAuthorized) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const now = new Date();

        if (targetType === "STAFF") {
            if (!targetId) return NextResponse.json({ error: "Staff ID is required" }, { status: 400 });
            await prisma.staff.update({
                where: { id: targetId },
                data: { sessionsRevokedAt: now }
            });
            console.log(`[Security] Revoked sessions for Staff: ${targetId} by Admin: ${user.userId}`);
        } else if (targetType === "USER") {
            if (!targetId) return NextResponse.json({ error: "User ID is required" }, { status: 400 });
            await prisma.user.update({
                where: { id: targetId },
                data: { sessionsRevokedAt: now }
            });
            console.log(`[Security] Revoked sessions for User: ${targetId} by Admin: ${user.userId}`);
        } else if (targetType === "SELF") {
            if (user.type === "admin") {
                await prisma.user.update({
                    where: { id: user.userId },
                    data: { sessionsRevokedAt: now }
                });
            } else {
                await prisma.staff.update({
                    where: { id: user.userId },
                    data: { sessionsRevokedAt: now }
                });
            }
            console.log(`[Security] User ${user.userId} revoked their own sessions.`);
        } else if (targetType === "GLOBAL_STAFF") {
            // Optional: Revoke all staff globally if needed
            await prisma.staff.updateMany({
                data: { sessionsRevokedAt: now }
            });
            console.log(`[Security] GLOBAL STAFF REVOCATION by Admin: ${user.userId}`);
        } else {
            return NextResponse.json({ error: "Invalid revocation type" }, { status: 400 });
        }

        const response = NextResponse.json({ success: true, revokedAt: now });

        // If revoking self, clear cookies to break the redirect loop
        if (targetType === "SELF") {
            const cookieOptions = {
                httpOnly: true,
                expires: new Date(0),
                path: "/",
                sameSite: "lax" as const
            };
            response.cookies.set("token", "", cookieOptions);
            response.cookies.set("staff_token", "", cookieOptions);
        }

        return response;
    } catch (error) {
        console.error("Revocation Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
