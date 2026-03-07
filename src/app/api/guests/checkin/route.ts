import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export async function POST(req: Request) {
    try {
        const user = await getServerUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { guestId, weddingId } = await req.json();

        if (!guestId || !weddingId) {
            return NextResponse.json({ error: "Missing guestId or weddingId" }, { status: 400 });
        }

        // Authorization Check:
        // 1. Staff must belong to the same weddingId
        // 2. Admins must own the wedding (or be platform owner)
        if (user.type === "staff") {
            if (user.weddingId !== weddingId) {
                return NextResponse.json({ error: "Access Denied: Staff mismatch" }, { status: 403 });
            }
        } else if (user.role !== ROLES.PLATFORM_OWNER) {
            const wedding = await prisma.wedding.findFirst({
                where: { id: weddingId, userId: user.userId }
            });
            if (!wedding) {
                return NextResponse.json({ error: "Access Denied: Wedding ownership mismatch" }, { status: 403 });
            }
        }

        // Mark Guest as Arrived
        const guest = await prisma.guest.update({
            where: { id: guestId, weddingId: weddingId },
            data: {
                hasArrived: true,
                arrivedAt: new Date()
            },
            select: { name: true, group: true }
        });

        // Audit Log
        await prisma.log.create({
            data: {
                action: "CHECK_IN",
                description: `Guest ${guest.name} checked in`,
                actorName: user.name || user.email || "Unknown Actor",
                weddingId: weddingId,
                ip: req.headers.get("x-forwarded-for") || "unknown"
            }
        });

        return NextResponse.json({
            success: true,
            guest: {
                name: guest.name,
                group: guest.group
            }
        });

    } catch (error: any) {
        console.error("Check-in Error:", error);
        return NextResponse.json({
            error: "Failed to check in guest",
            details: error.message
        }, { status: 500 });
    }
}
