import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { decrypt } from "@/lib/encryption";

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

        const guests = await prisma.guest.findMany({
            where: { weddingId },
            orderBy: { name: "asc" }
        });

        // Generate CSV content
        // BOM for Excel UTF-8 support
        let csvContent = "\uFEFF";
        csvContent += "ឈ្មោះភ្ញៀវ (Name),លេខទូរស័ព្ទ (Phone),ក្រុម (Group),មកពី (Source),ស្ថានភាពគ្រួសារ (Arrived),កាលបរិច្ឆេទ (Created At)\n";

        guests.forEach(guest => {
            const name = guest.name.replace(/,/g, " ");
            const phone = guest.phone ? decrypt(guest.phone).replace(/,/g, " ") : "";
            const group = (guest.group || "").replace(/,/g, " ");
            const source = (guest.source || "").replace(/,/g, " ");
            const arrived = guest.hasArrived ? "Yes" : "No";
            const createdAt = guest.createdAt.toISOString();

            csvContent += `${name},${phone},${group},${source},${arrived},${createdAt}\n`;
        });

        const response = new NextResponse(csvContent);
        response.headers.set("Content-Type", "text/csv; charset=utf-8");
        response.headers.set("Content-Disposition", `attachment; filename="wedding_guests_${weddingId}.csv"`);

        return response;

    } catch (error) {
        console.error("Export Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
