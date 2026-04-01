import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const config = await prisma.systemConfig.findUnique({
            where: { id: "GLOBAL" }
        });

        // Dynamic Pricing with Production Fallbacks
        return NextResponse.json({ 
            standard: config?.stadPrice ?? 9.00,
            pro: config?.proPrice ?? 19.00
        });
    } catch (error) {
        console.error("[API/PRICING] Error fetching price:", error);
        // Safe defaults if database fails
        return NextResponse.json({ standard: 9.00, pro: 19.00 });
    }
}
