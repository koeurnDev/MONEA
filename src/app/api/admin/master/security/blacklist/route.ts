import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";

export async function GET() {
    try {
        const user = await getServerUser();
        if (!user || (user.role !== "SUPERADMIN" && user.role !== "OWNER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const blacklist = await (prisma as any).blacklistedIP.findMany({
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(blacklist);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch blacklist" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getServerUser();
        if (!user || (user.role !== "SUPERADMIN" && user.role !== "OWNER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { ip, reason } = await req.json();
        if (!ip) return NextResponse.json({ error: "IP is required" }, { status: 400 });

        const entry = await (prisma as any).blacklistedIP.upsert({
            where: { ip },
            create: { ip, reason },
            update: { reason }
        });

        return NextResponse.json(entry);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update blacklist" }, { status: 500 });
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
        if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

        await (prisma as any).blacklistedIP.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
