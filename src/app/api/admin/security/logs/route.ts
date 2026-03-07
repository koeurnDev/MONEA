export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";

export async function GET() {
    const user = await getServerUser();
    if (!user || user.type !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const logs = await prisma.securityLog.findMany({
            where: user.role === "SUPERADMIN" ? {} : {
                email: user.email
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 20
        });

        return NextResponse.json(logs);
    } catch (error) {
        console.error("[API/Security/Logs] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
