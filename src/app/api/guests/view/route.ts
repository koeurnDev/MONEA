export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { errorResponse } from "@/lib/api-utils";

export async function OPTIONS(req: Request) {
    const response = new NextResponse(null, { status: 200 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
}

export async function POST(req: Request) {
    try {
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }

        const { guestId } = body;

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
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
