export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { sanitizeObject } from "@/lib/sanitize";
import { encrypt } from "@/lib/encryption";

export async function POST(req: Request) {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { guests } = body;

        if (!Array.isArray(guests)) {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
        }

        if (guests.length > 500) {
            return NextResponse.json({ error: "Too many guests at once (Max 500)" }, { status: 400 });
        }

        let weddingId = null;
        if (user.type === "staff") {
            weddingId = user.weddingId!;
        } else {
            const wedding = await prisma.wedding.findFirst({ where: { userId: user.userId } });
            if (!wedding) {
                return NextResponse.json({ error: "Please create a wedding profile first" }, { status: 403 });
            }
            weddingId = wedding.id;
        }

        console.log(`[BulkImport] User ${user.userId} importing ${guests.length} guests for wedding ${weddingId}`);

        if (!weddingId) {
            console.error("[BulkImport] Error: weddingId is null");
            return NextResponse.json({ error: "Wedding ID not found" }, { status: 400 });
        }

        // Get current guest count to continue sequence
        const currentCount = await prisma.guest.count({ where: { weddingId } });
        console.log(`[BulkImport] Current count: ${currentCount}`);

        const dataToInsert = guests.map((g: any, index: number) => {
            const sanitized = sanitizeObject<any>(g);
            return {
                name: sanitized.name || "Guest",
                // Encrypt phone before saving for security
                phone: sanitized.phone ? encrypt(sanitized.phone) : "",
                group: sanitized.group || "Friend",
                weddingId: weddingId as string,
                sequenceNumber: currentCount + index + 1,
            };
        });

        console.log(`[BulkImport] Prepared ${dataToInsert.length} items. Phone encrypted.`);

        let count = 0;
        try {
            // Try high-performance createMany first
            const result = await prisma.guest.createMany({
                data: dataToInsert
            });
            count = result.count;
        } catch (createManyError: any) {
            console.warn("[BulkImport] createMany failed, falling back to manual batch:", createManyError.message);
            // Fallback: Manual batch creation if createMany is not supported by current client
            const results = await prisma.$transaction(
                dataToInsert.map(data => prisma.guest.create({ data }))
            );
            count = results.length;
        }

        console.log(`[BulkImport] Success. Created ${count} guests.`);
        return NextResponse.json({ success: true, count });
    } catch (error: any) {
        console.error("[BulkImport] CRITICAL Error:", error);
        return NextResponse.json({ 
            error: "Failed to import guests", 
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ message: "GUESTS BULK API ACTIVE" });
}
