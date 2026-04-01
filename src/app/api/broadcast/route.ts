export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // Use Raw SQL to bypass Prisma Client sync issues on Windows
        const broadcasts = await (prisma as any).$queryRawUnsafe(`
            SELECT * FROM "Broadcast"
            WHERE active = true
            AND ( "scheduledAt" IS NULL OR "scheduledAt" <= NOW() )
            AND ( "expiresAt" IS NULL OR "expiresAt" > NOW() )
            ORDER BY "createdAt" DESC
        `);

        return NextResponse.json(broadcasts);
    } catch (error) {
        console.error("Broadcast Fetch Error:", error);
        return NextResponse.json([], { status: 500 });
    }
}
