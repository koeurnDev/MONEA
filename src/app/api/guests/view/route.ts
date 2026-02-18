export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { guestId } = await req.json();

        if (!guestId) {
            return new NextResponse("Guest ID is required", { status: 400 });
        }

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
