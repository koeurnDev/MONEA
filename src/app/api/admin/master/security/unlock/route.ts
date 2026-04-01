export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export async function POST(req: Request) {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { accountId, type } = await req.json();

        if (!accountId || !type) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        if (type === "User" || type === "Admin") {
            await prisma.user.update({
                where: { id: accountId },
                data: { failedAttempts: 0, lockedUntil: null }
            });
        } else if (type === "Staff") {
            await prisma.staff.update({
                where: { id: accountId },
                data: { failedAttempts: 0, lockedUntil: null }
            });
        } else {
            return NextResponse.json({ error: "Invalid account type" }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("[Unlock API Error]", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
