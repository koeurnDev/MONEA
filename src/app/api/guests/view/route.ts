import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { errorResponse } from "@/lib/api-utils";

export async function POST(req: Request) {
    try {
        const { guestId } = await req.json();

        if (!guestId) {
            return errorResponse("Guest ID is required", 400);
        }

        // Verify guest exists before incrementing
        const guest = await prisma.guest.findUnique({ where: { id: guestId } });
        if (!guest) return errorResponse("Guest not found", 404);

        await prisma.guest.update({
            where: { id: guestId },
            data: {
                views: { increment: 1 }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("View Update Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
