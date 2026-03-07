export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const broadcasts = await prisma.broadcast.findMany({
            where: {
                active: true,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(broadcasts);
    } catch (error) {
        console.error("Broadcast Fetch Error:", error);
        return NextResponse.json([], { status: 500 });
    }
}
