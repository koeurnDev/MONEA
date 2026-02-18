import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const user = await getServerUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { subject, message, priority, weddingId } = body;

        if (!subject || !message || !weddingId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Verify user owns the wedding
        const wedding = await prisma.wedding.findUnique({
            where: { id: weddingId },
            select: { userId: true }
        });

        if (!wedding || (wedding as any).userId !== (user as any).id) {
            return NextResponse.json({ error: "Invalid wedding ID" }, { status: 403 });
        }

        const ticket = await (prisma as any).supportTicket.create({
            data: {
                subject,
                message,
                priority: priority || "NORMAL",
                weddingId,
                userId: (user as any).id,
                status: "OPEN"
            }
        });

        return NextResponse.json(ticket);
    } catch (error) {
        console.error("Support Ticket Error:", error);
        return NextResponse.json({ error: "Failed to submit ticket" }, { status: 500 });
    }
}
