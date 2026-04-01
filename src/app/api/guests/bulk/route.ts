export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { queryRaw, executeRaw } from "@/lib/prisma";
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
            // Use Raw SQL for stability
            const results = await queryRaw('SELECT id FROM "Wedding" WHERE "userId" = $1 LIMIT 1', user.userId);
            if (!results.length) {
                return NextResponse.json({ error: "Please create a wedding profile first" }, { status: 403 });
            }
            weddingId = results[0].id;
        }

        console.log(`[BulkImport] User ${user.userId} importing ${guests.length} guests for wedding ${weddingId}`);

        if (!weddingId) {
            console.error("[BulkImport] Error: weddingId is null");
            return NextResponse.json({ error: "Wedding ID not found" }, { status: 400 });
        }

        // Get current guest count using Raw SQL
        const counts = await queryRaw('SELECT COUNT(*)::int as count FROM "Guest" WHERE "weddingId" = $1', weddingId);
        const currentCount = counts[0]?.count || 0;
        console.log(`[BulkImport] Current count: ${currentCount}`);

        // Prepare data for batch insert
        const values: any[] = [];
        let placeholderIdx = 1;
        const valueStrings = guests.map((g: any, index: number) => {
            const sanitized = sanitizeObject<any>(g);
            const name = sanitized.name || "Guest";
            const phone = sanitized.phone ? encrypt(sanitized.phone) : "";
            const group = sanitized.group || "Friend";
            const sequenceNum = currentCount + index + 1;
            
            const startIdx = placeholderIdx;
            placeholderIdx += 5;
            values.push(name, phone, group, weddingId, sequenceNum);
            
            return `($${startIdx}, $${startIdx + 1}, $${startIdx + 2}, $${startIdx + 3}, $${startIdx + 4})`;
        });

        const sql = `
            INSERT INTO "Guest" (name, phone, "group", "weddingId", "sequenceNumber")
            VALUES ${valueStrings.join(", ")}
        `;

        console.log(`[BulkImport] Executing batch insert for ${guests.length} items.`);
        const count = await executeRaw(sql, ...values);

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
