export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

async function getUser() {
    const token = cookies().get("token")?.value;
    if (!token) return null;

    try {
        const decoded = verifyToken(token) as any;
        if (decoded && typeof decoded === "object") {
            const role = decoded.role?.toUpperCase() || "ADMIN";
            const userId = decoded.userId || decoded.sub || decoded.id;
            return { ...decoded, role, userId } as any;
        }
    } catch (e) { }

    return null;
}

export async function GET() {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const wedding = await prisma.wedding.findFirst({
        where: { userId: user.userId },
        select: { notes: true }
    });

    if (!wedding) return NextResponse.json({ error: "Wedding not found" }, { status: 404 });

    return NextResponse.json({ notes: wedding.notes || "" });
}

export async function PATCH(req: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { notes } = await req.json();

    const wedding = await prisma.wedding.findFirst({
        where: { userId: user.userId }
    });

    if (!wedding) return NextResponse.json({ error: "Wedding not found" }, { status: 404 });

    const updated = await prisma.wedding.update({
        where: { id: wedding.id },
        data: { notes }
    });

    return NextResponse.json({ notes: updated.notes });
}
