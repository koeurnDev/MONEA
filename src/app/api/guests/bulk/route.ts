import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

async function getUser() {
    const token = cookies().get("token")?.value;
    if (!token) return null;
    const decoded = verifyToken(token);
    return decoded as { userId: string, role: string } | null;
}

export async function POST(req: Request) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Role check: Admin or Staff can import? Let's allow Staff for now to add.

    const body = await req.json();
    const { guests } = body;

    if (!Array.isArray(guests)) {
        return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    try {
        let wedding = await prisma.wedding.findFirst({ where: { userId: user.userId } });
        if (!wedding) {
            wedding = await prisma.wedding.create({
                data: { userId: user.userId, groomName: "Groom", brideName: "Bride", date: new Date() }
            });
        }

        console.log(`[BulkImport] User ${user.userId} importing ${guests.length} guests for wedding ${wedding.id}`);

        // Optimize: createMany
        const result = await prisma.guest.createMany({
            data: guests.map((g: any) => ({
                name: g.name,
                phone: g.phone || "",
                group: g.group || "Friend",
                weddingId: wedding?.id || "",
            }))
        });

        console.log(`[BulkImport] Success. Created ${result.count} guests.`);
        return NextResponse.json({ success: true, count: result.count });
    } catch (error: any) {
        console.error("[BulkImport] Error:", error);
        return NextResponse.json({ error: "Failed to import guests", details: error.message }, { status: 500 });
    }
}
