export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

async function getUser() {
    const token = cookies().get("token")?.value;
    if (!token) return null;
    const decoded = verifyToken(token);
    return decoded as { userId: string, role: string } | null;
}

export async function GET() {
    const user = await getUser();
    if (!user || user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
        select: { id: true, email: true, role: true, createdAt: true }
    });

    return NextResponse.json(users);
}

export async function PUT(req: Request) {
    const user = await getUser();
    if (!user || user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { id, role } = body;

    const updatedUser = await prisma.user.update({
        where: { id },
        data: { role }
    });

    return NextResponse.json(updatedUser);
}
