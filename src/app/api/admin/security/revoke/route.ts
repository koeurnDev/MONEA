export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const user = await getServerUser();
        if (!user || (user.role !== "OWNER" && user.role !== "SUPERADMIN" && user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { targetType, targetId } = body; // targetType: 'GLOBAL', 'STAFF', 'USER'

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
        } else if (targetType === "GLOBAL_STAFF") {
            // Optional: Revoke all staff globally if needed
            await prisma.staff.updateMany({
                data: { sessionsRevokedAt: now }
            });
            console.log(`[Security] GLOBAL STAFF REVOCATION by Admin: ${user.userId}`);
        } else {
            return NextResponse.json({ error: "Invalid revocation type" }, { status: 400 });
        }

        return NextResponse.json({ success: true, revokedAt: now });
    } catch (error) {
        console.error("Revocation Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
