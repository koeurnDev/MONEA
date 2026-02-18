export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const user = await getServerUser();
        if (!user || (user.role !== "SUPERADMIN" && user.role !== "OWNER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: search } },
                    { email: { contains: search } }
                ]
            },
            include: {
                _count: {
                    select: { weddings: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const admin = await getServerUser();
        if (!admin || (admin.role !== "SUPERADMIN" && admin.role !== "OWNER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { userId, role, revokeSessions } = body;

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        const updateData: any = {};
        if (role) updateData.role = role;
        if (revokeSessions) updateData.sessionsRevokedAt = new Date();

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}
