import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const user = await getServerUser();
        if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN" && user.role !== "OWNER")) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const weddingId = searchParams.get("weddingId");

        if (!weddingId) {
            return new NextResponse("Wedding ID is required", { status: 400 });
        }

        // Verify ownership/access
        if (user.role !== "SUPERADMIN") {
            const wedding = await prisma.wedding.findFirst({
                where: { id: weddingId, userId: user.userId }
            });
            if (!wedding) return new NextResponse("Unauthorized access to this wedding", { status: 403 });
        }

        const gifts = await prisma.gift.findMany({
            where: { weddingId },
            include: { guest: true },
            orderBy: { createdAt: "desc" }
        });

        // Generate CSV content
        // BOM for Excel UTF-8 support
        let csvContent = "\uFEFF";
        csvContent += "ឈ្មោះភ្ញៀវ (Guest),ចំនួនទឹកប្រាក់ (Amount),រូបិយប័ណ្ណ (Currency),មធ្យោបាយ (Method),កាលបរិច្ឆេទ (Date)\n";

        gifts.forEach(gift => {
            const guestName = (gift.guest?.name || "Unknown").replace(/,/g, " ");
            const amount = gift.amount;
            const currency = gift.currency;
            const method = (gift.method || "Cash").replace(/,/g, " ");
            const date = gift.createdAt.toISOString();

            csvContent += `${guestName},${amount},${currency},${method},${date}\n`;
        });

        const response = new NextResponse(csvContent);
        response.headers.set("Content-Type", "text/csv; charset=utf-8");
        response.headers.set("Content-Disposition", `attachment; filename="wedding_gifts_${weddingId}.csv"`);

        return response;

    } catch (error) {
        console.error("Export Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
