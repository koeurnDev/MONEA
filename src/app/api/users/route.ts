export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export async function GET() {
    const user = await getServerUser();
    if (!user || user.role !== ROLES.PLATFORM_OWNER) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
        select: { id: true, email: true, role: true, createdAt: true }
    });

    return NextResponse.json(users);
}

export async function PUT(req: Request) {
    const user = await getServerUser();
    if (!user || user.role !== ROLES.PLATFORM_OWNER) {
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
