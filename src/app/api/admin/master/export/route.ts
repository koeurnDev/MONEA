export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

function escapeCSV(val: any) {
    if (val === null || val === undefined) return "";
    const sanitized = String(val).replace(/,/g, " ");
    if (sanitized.startsWith('=') || sanitized.startsWith('+') || sanitized.startsWith('-') || sanitized.startsWith('@')) {
        return `'${sanitized}`;
    }
    return sanitized;
}

export async function GET() {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const weddings = await prisma.wedding.findMany({
            include: {
                user: { select: { name: true, email: true } },
                _count: { select: { guests: true, gifts: true } }
            }
        });

        // Generate CSV rows
        const headers = ["ID", "Groom", "Bride", "Date", "Status", "Package", "Owner", "GuestsCount", "GiftsCount"];
        const rows = weddings.map(w => [
            escapeCSV(w.id),
            escapeCSV(w.groomName),
            escapeCSV(w.brideName),
            w.date.toISOString(),
            escapeCSV(w.status),
            escapeCSV(w.packageType),
            escapeCSV(w.user.email),
            w._count.guests,
            w._count.gifts
        ].join(","));

        const csvContent = [headers.join(","), ...rows].join("\n");

        return new NextResponse(csvContent, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename=monea_master_export_${new Date().toISOString().split('T')[0]}.csv`
            }
        });
    } catch (error) {
        console.error("Export Error:", error);
        return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
    }
}
