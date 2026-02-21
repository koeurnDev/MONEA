export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";

export async function GET() {
    try {
        const user = await getServerUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // For staff users, return minimal data
        if (user.type === "staff") {
            return NextResponse.json({
                id: user.userId,
                role: user.role,
                name: user.name,
                type: "staff"
            });
        }

        // For admin/owner users, fetch full profile
        const dbUser = await prisma.user.findUnique({
            where: { id: user.userId },
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ ...dbUser, type: "admin" });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
