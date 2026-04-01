export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma, queryRaw } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";

export async function GET() {
    const user = await getServerUser();
    if (!user || user.type !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const logs = await queryRaw(`
            SELECT * FROM "SecurityLog" 
            WHERE $1 = 'SUPERADMIN' OR email = $2
            ORDER BY "createdAt" DESC 
            LIMIT 20
        `, user.role, user.email);

        return NextResponse.json(logs);
    } catch (error) {
        console.error("[API/Security/Logs] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
