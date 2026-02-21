export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/encryption";

import { ROLES } from "@/lib/constants";

// Helper to check Admin
async function isAdmin() {
    const token = cookies().get("token")?.value;
    if (!token) return false;
    const user = verifyToken(token) as { userId: string, role: string } | null;
    return user && (user.role === ROLES.PLATFORM_OWNER || user.role === ROLES.EVENT_MANAGER);
}

export async function GET(req: Request) {
    if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    const decryptedWeddings = weddings.map(wedding => ({
        ...wedding,
        paymentInfo: wedding.paymentInfo ? decrypt(wedding.paymentInfo) : wedding.paymentInfo
    }));

    return NextResponse.json({
        data: decryptedWeddings,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    });
}

export async function PUT(req: Request) {
    if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id, packageType, status, expiresAt } = await req.json();

        const updated = await prisma.wedding.update({
            where: { id },
            data: {
                packageType,
                status,
                expiresAt: expiresAt ? new Date(expiresAt) : null
            }
        });

        return NextResponse.json(updated);
    } catch (e) {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}
