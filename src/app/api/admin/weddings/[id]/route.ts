export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

// Legacy getAdminUser removed

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const user = await getServerUser();
    if (!user || (user.role !== ROLES.PLATFORM_OWNER && user.role !== ROLES.EVENT_MANAGER)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const weddingId = params.id;

    try {
        const wedding = await prisma.wedding.findUnique({
            where: { id: weddingId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        createdAt: true
                    }
                },
                activities: {
                    orderBy: { time: 'asc' }
                },
                _count: {
                    select: { guests: true }
                }
            }
        });

        if (!wedding) {
            return NextResponse.json({ error: "Wedding not found" }, { status: 404 });
        }

        return NextResponse.json({ data: wedding });
    } catch (error) {
        console.error("Error fetching admin wedding detail:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
