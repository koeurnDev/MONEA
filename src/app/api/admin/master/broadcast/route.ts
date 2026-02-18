export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";

export async function GET() {
    try {
        const broadcasts = await (prisma as any).broadcast.findMany({
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json(broadcasts);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch broadcasts" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getServerUser();
        if (!user || (user.role !== "SUPERADMIN" && user.role !== "OWNER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { title, message, type, expiresAt } = body;

        const broadcast = await (prisma as any).broadcast.create({
            data: {
                title,
                message,
                type: type || "INFO",
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                active: true
            }
        });

        return NextResponse.json(broadcast);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create broadcast" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const user = await getServerUser();
        if (!user || (user.role !== "SUPERADMIN" && user.role !== "OWNER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await (prisma as any).broadcast.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete broadcast" }, { status: 500 });
    }
}
