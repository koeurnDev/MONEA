import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

async function getAdminUser() {
    const token = cookies().get("token")?.value;
    if (!token) return null;
    const decoded = verifyToken(token) as { userId: string, role: string } | null;
    if (!decoded || (decoded.role !== "OWNER" && decoded.role !== "ADMIN" && decoded.role !== "SUPERADMIN")) return null;
    return decoded;
}

export async function GET() {
    const user = await getAdminUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                weddings: {
                    select: {
                        id: true,
                        groomName: true,
                        brideName: true,
                        status: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
