import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { guestId, weddingId, rsvpStatus, adultsCount, childrenCount, rsvpNotes } = await req.json();

        if (!weddingId || !rsvpStatus) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. If we have a guestId (from a specific link), update that guest
        if (guestId) {
            const updatedGuest = await prisma.guest.update({
                where: { id: guestId },
                data: {
                    rsvpStatus,
                    adultsCount: adultsCount || 1,
                    childrenCount: childrenCount || 0,
                    rsvpNotes,
                    rsvpAt: new Date(),
                }
            });
            return NextResponse.json({ success: true, guest: updatedGuest });
        }

        // 2. If no guestId, it might be a general RSVP (Anonymous)
        // For now, we only support RSVP for imported guests to prevent spam, 
        // but we could create a "General Guest" here if needed.

        return NextResponse.json({ error: "Guest identification required for RSVP" }, { status: 400 });

    } catch (error) {
        console.error("RSVP Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
