import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { sanitizeObject } from "@/lib/sanitize";

export async function POST(req: Request) {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Role check: Admin or Staff can import? Let's allow Staff for now to add.

    const body = await req.json();
    const { guests } = body;

    if (!Array.isArray(guests)) {
        return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    if (guests.length > 500) {
        return NextResponse.json({ error: "Too many guests at once (Max 500)" }, { status: 400 });
    }

    try {
        let weddingId = null;
        if (user.type === "staff") {
            weddingId = user.weddingId!;
        } else {
            const wedding = await prisma.wedding.findFirst({ where: { userId: user.userId } });
            if (!wedding) {
                return NextResponse.json({ error: "សូមបង្កើតព័ត៌មានមង្គលការជាមុនសិន (Please create a wedding profile first)" }, { status: 403 });
            }
            weddingId = wedding.id;
        }

        console.log(`[BulkImport] User ${user.userId} importing ${guests.length} guests for wedding ${weddingId}`);

        // Optimize: createMany
        const result = await prisma.guest.createMany({
            data: guests.map((g: any) => {
                const sanitized = sanitizeObject<any>(g);
                return {
                    name: sanitized.name || "Guest",
                    phone: sanitized.phone || "",
                    group: sanitized.group || "Friend",
                    weddingId: weddingId,
                };
            })
        });

        console.log(`[BulkImport] Success. Created ${result.count} guests.`);
        return NextResponse.json({ success: true, count: result.count });
    } catch (error: any) {
        console.error("[BulkImport] Error:", error);
        return NextResponse.json({ error: "Failed to import guests", details: error.message }, { status: 500 });
    }
}
