export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";

export async function GET(req: Request) {
    const user = await getServerUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const action = searchParams.get("action");

    try {
        let whereClause: any = action ? { action } : {};

        if (user.role === "SUPERADMIN") {
            // Superadmins don't see wedding-specific activity logs per the user's request
            return NextResponse.json([]);
        }

        if (user.role === "ADMIN") {
            // Admins should only see logs for weddings they own
            const userWeddings = await prisma.wedding.findMany({
                where: { userId: (user as any).id },
                select: { id: true }
            });
            const weddingIds = userWeddings.map(w => w.id);

            whereClause = {
                ...whereClause,
                weddingId: { in: weddingIds }
            };
        }

        const logs = await prisma.log.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            take: limit,
        });

        return NextResponse.json(logs);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
    }
}
