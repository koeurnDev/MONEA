import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    let dbStatus = "Checking...";
    try {
        await prisma.$queryRaw`SELECT 1`;
        dbStatus = "Connected";
    } catch (e: any) {
        dbStatus = `Failed: ${e.message}`;
    }

    let userStatus = "Checking...";
    try {
        const user = await getServerUser();
        userStatus = user ? `Found (Role: ${user.role})` : "Not Logged In";
    } catch (e: any) {
        userStatus = `CRASH: ${e.message}`;
    }

    return NextResponse.json({
        status: "ok",
        db: dbStatus,
        user: userStatus,
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
