export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { errorResponse } from "@/lib/api-utils";

export async function GET(req: Request) {
    try {
        const user = await getServerUser();
        if (!user) return errorResponse("Unauthorized", 401);

        let weddingId = null;
        if (user.type === "staff") {
            weddingId = user.weddingId!;
        } else {
            const wedding = await prisma.wedding.findFirst({ where: { userId: user.userId } });
            if (wedding) weddingId = wedding.id;
        }

        if (!weddingId) return NextResponse.json({ guests: { total: 0, arrived: 0 } });

        const [totalGuests, arrivedGuests] = await Promise.all([
            prisma.guest.count({ where: { weddingId } }),
            prisma.guest.count({ where: { weddingId, hasArrived: true } })
        ]);

        return NextResponse.json({
            guests: {
                total: totalGuests,
                arrived: arrivedGuests
            }
        });
    } catch (e) {
        console.error("Live Stats Error:", e);
        return errorResponse("Failed to fetch live stats", 500);
    }
}
