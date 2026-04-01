export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { decrypt } from "@/lib/encryption";

import { ROLES } from "@/lib/constants";

// Authorization handled via getServerUser

export async function GET(req: Request) {
    const user = await getServerUser();
    if (!user || user.role !== ROLES.PLATFORM_OWNER) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const [weddings, total] = await Promise.all([
        prisma.wedding.findMany({
            include: {
                user: {
                    select: { email: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: skip
        }),
        prisma.wedding.count()
    ]);

    return NextResponse.json({
        data: weddings, // paymentInfo is encrypted in DB, we don't decrypt it here for the list
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    });
}

export async function PUT(req: Request) {
    const user = await getServerUser();
    if (!user || user.role !== ROLES.PLATFORM_OWNER) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id, packageType, status, expiresAt, paymentStatus } = await req.json();

        const updated = await prisma.wedding.update({
            where: { id },
            data: {
                packageType,
                status,
                paymentStatus,
                expiresAt: expiresAt ? new Date(expiresAt) : null
            }
        });

        return NextResponse.json(updated);
    } catch (e) {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}
