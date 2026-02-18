export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const user = await getServerUser();
        if (!user || (user.role !== "SUPERADMIN" && user.role !== "OWNER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Aggregate Weddings by Month (last 12 months)
        const weddingsByMonth = await prisma.$queryRaw`
            SELECT strftime('%Y-%m', createdAt) as month, COUNT(*) as count 
            FROM Wedding 
            GROUP BY month 
            ORDER BY month DESC 
            LIMIT 12
        `;

        // Aggregate Gifts by Month (Simplified)
        const giftsByMonth = await prisma.$queryRaw`
            SELECT strftime('%Y-%m', createdAt) as month, SUM(amount) as total, currency
            FROM Gift 
            GROUP BY month, currency
            ORDER BY month DESC 
            LIMIT 24
        `;

        // Package distribution
        const packageDist = await prisma.wedding.groupBy({
            by: ['packageType'],
            _count: true
        });

        return NextResponse.json({
            weddingsByMonth,
            giftsByMonth,
            packageDist
        });
    } catch (error) {
        console.error("Master Analytics Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
