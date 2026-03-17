export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { decrypt } from "@/lib/encryption";
import { ROLES } from "@/lib/constants";

function escapeCSV(val: any) {
    if (typeof val !== 'string') return val;
    const sanitized = val.replace(/,/g, " ");
    // Protect against CSV Injection (Excel Formula Injection)
    if (sanitized.startsWith('=') || sanitized.startsWith('+') || sanitized.startsWith('-') || sanitized.startsWith('@')) {
        return `'${sanitized}`;
    }
    return sanitized;
}

export async function GET(req: Request) {
    try {
        const user = await getServerUser();
        if (!user) return new NextResponse("Unauthorized", { status: 401 });

        const { searchParams } = new URL(req.url);
        const weddingId = searchParams.get("weddingId");

        if (!weddingId) {
            return new NextResponse("Wedding ID is required", { status: 400 });
        }

        // Verify ownership/access
        if (user.role !== ROLES.PLATFORM_OWNER) {
            const wedding = await prisma.wedding.findFirst({
                where: { id: weddingId, userId: user.userId },
                select: { id: true, userId: true, packageType: true }
            });
            if (!wedding) return new NextResponse("Unauthorized access to this wedding", { status: 403 });

            // SECURITY: Enforce Premium/Pro for Export
            if (wedding.packageType !== "PREMIUM" && wedding.packageType !== "PRO") {
                return new NextResponse("Export feature requires a PRO or PREMIUM package", { status: 403 });
            }
        }

        const guests = await prisma.guest.findMany({
            where: { weddingId },
            orderBy: { name: "asc" }
        });

        // Generate CSV content
        // BOM for Excel UTF-8 support
        let csvContent = "\uFEFF";
        csvContent += "ល.រ,ឈ្មោះភ្ញៀវ,មកពីណា / ទីតាំង\n";

        guests.forEach((guest: any, index: number) => {
            const no = guest.sequenceNumber || (index + 1);
            const name = escapeCSV(guest.name);
            const group = escapeCSV(guest.group || guest.source || "");

            csvContent += `${no},${name},${group}\n`;
        });

        const response = new NextResponse(csvContent);
        response.headers.set("Content-Type", "text/csv; charset=utf-8");
        response.headers.set("Content-Disposition", `attachment; filename="Monea_GuestList_${weddingId}.csv"`);

        return response;

    } catch (error) {
        console.error("Export Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
