export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { sanitizeObject } from "@/lib/sanitize";

export async function GET() {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const wedding = await prisma.wedding.findFirst({
        where: { userId: user.userId },
        select: { notes: true }
    });

    if (!wedding) return NextResponse.json({ error: "Wedding not found" }, { status: 404 });

    return NextResponse.json({ notes: wedding.notes || "" });
}

export async function PATCH(req: Request) {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { notes } = sanitizeObject<any>(body);

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
