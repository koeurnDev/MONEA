import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitize } from "@/lib/sanitize";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { guestId, weddingId, rsvpStatus, adultsCount, childrenCount, rsvpNotes, website } = body;

        // Honeypot detection
        if (website) {
            console.warn(`[BOT_DETECTION] RSVP Honeypot triggered. Payload:`, { guestId, weddingId, website });
            return NextResponse.json({ success: true }); // Silently return success
        }

        if (!weddingId || !rsvpStatus) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Sanitize notes to prevent XSS
        const sanitizedNotes = rsvpNotes ? sanitize(rsvpNotes) : null;

        // 1. If we have a guestId (from a specific link), update that guest
        if (guestId) {
            // SECURITY: BOLA Protection - verify guest belongs to the targeted wedding
            const existingGuest = await prisma.guest.findUnique({ 
                where: { id: guestId },
                select: { weddingId: true }
            });

            if (!existingGuest) return NextResponse.json({ error: "Guest not found" }, { status: 404 });
            if (existingGuest.weddingId !== weddingId) {
                console.error(`[Security] BOLA Attempt: Guest ${guestId} does not belong to wedding ${weddingId}`);
                return NextResponse.json({ error: "Access denied" }, { status: 403 });
            }

            const updatedGuest = await prisma.guest.update({
                where: { id: guestId },
                data: {
                    rsvpStatus,
                    adultsCount: adultsCount || 1,
                    childrenCount: childrenCount || 0,
                    rsvpNotes: sanitizedNotes,
                    rsvpAt: new Date(),
                }
            });
            return NextResponse.json({ success: true, guest: updatedGuest });
        }

        // 2. If no guestId, create a new guest (Anonymous/General RSVP)
        const newGuest = await prisma.guest.create({
            data: {
                weddingId,
                name: rsvpNotes?.startsWith("Name: ") ? rsvpNotes.replace("Name: ", "").substring(0, 50) : "General Guest",
                rsvpStatus,
                adultsCount: adultsCount || 1,
                childrenCount: childrenCount || 0,
                rsvpNotes: rsvpNotes || "General RSVP",
                rsvpAt: new Date(),
                source: "WEBSITE_RSVP"
            }
        });

        return NextResponse.json({ success: true, guest: newGuest });

    } catch (error) {
        console.error("RSVP Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
