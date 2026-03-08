import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    let dbStatus = "Checking...";
    try {
        await prisma.$queryRaw`SELECT 1`;
        dbStatus = "Connected";
    } catch (e: any) {
        dbStatus = `Failed: ${e.message}`;
    }

    return NextResponse.json({
        status: "ok",
        db: dbStatus,
        time: new Date().toISOString()
    });
}

export async function POST() {
    return NextResponse.json({
        status: "ok",
        method: "POST",
        message: "Diagnostic POST reached"
    });
}
