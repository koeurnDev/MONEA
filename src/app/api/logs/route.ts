export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";

// Legacy getUser removed in favor of getServerUser

export async function GET() {
    try {
        const user = await getServerUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const weddingId = (user as any).weddingId || (await prisma.wedding.findFirst({ where: { userId: user.userId } }))?.id;
        if (!weddingId) return NextResponse.json([]);

        const logs = await prisma.log.findMany({
            where: { weddingId: weddingId },
            orderBy: { createdAt: "desc" },
            take: 50
        });

        return NextResponse.json(logs);
    } catch (error: any) {
        console.error("Error fetching logs:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}