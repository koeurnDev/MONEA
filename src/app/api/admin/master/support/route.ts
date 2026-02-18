import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";

export async function GET() {
    try {
        const user = await getServerUser();
        if (!user || (user.role !== "SUPERADMIN" && user.role !== "OWNER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tickets = await (prisma as any).supportTicket.findMany({
            include: {
                wedding: { select: { groomName: true, brideName: true } },
                user: { select: { name: true, email: true } }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(tickets);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const user = await getServerUser();
        if (!user || (user.role !== "SUPERADMIN" && user.role !== "OWNER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, status } = body;

        const ticket = await (prisma as any).supportTicket.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json(ticket);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
    }
}
