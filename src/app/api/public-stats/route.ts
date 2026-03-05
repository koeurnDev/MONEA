export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // Fetch real counts from the database
        const [totalWeddings, totalGuests] = await Promise.all([
            prisma.wedding.count(),
            prisma.guest.count()
        ]);

        // Return pure raw counts from the database (No offsets as requested)
        return NextResponse.json({
            couples: totalWeddings,
            guests: totalGuests,
            templates: 12, // Based on actual templates
            events: totalWeddings
        });
    } catch (error) {
        console.error("Public stats error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
