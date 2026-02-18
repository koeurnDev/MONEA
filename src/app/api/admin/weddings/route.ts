import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/encryption";

// Helper to check Admin
async function isAdmin() {
    const token = cookies().get("token")?.value;
    if (!token) return false;
    const user = verifyToken(token) as { userId: string, role: string } | null;
    return user && (user.role === 'ADMIN' || user.role === 'SUPERADMIN' || user.role === 'OWNER');
}

export async function GET() {
    if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const weddings = await prisma.wedding.findMany({
        include: {
            user: {
                select: { email: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const decryptedWeddings = weddings.map(wedding => ({
        ...wedding,
        paymentInfo: wedding.paymentInfo ? decrypt(wedding.paymentInfo) : wedding.paymentInfo
    }));

    return NextResponse.json(decryptedWeddings);
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
