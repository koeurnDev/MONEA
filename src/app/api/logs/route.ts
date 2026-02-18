import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import fs from 'fs';

export const dynamic = 'force-dynamic';

async function getUser() {
    const token = cookies().get("token")?.value;
    if (!token) return null;
    try {
        const decoded = verifyToken(token) as any;
        if (decoded && typeof decoded === "object") {
            const role = decoded.role?.toUpperCase() || "ADMIN";
            const userId = decoded.userId || decoded.sub || decoded.id;
            return { ...decoded, role, userId } as { userId: string, role: string };
        }
    } catch (e) { }
    return null;
}

export async function GET() {
    try {
        const user = await getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const wedding = await prisma.wedding.findFirst({ where: { userId: user.userId } });
        if (!wedding) return NextResponse.json([]);

        const logs = await prisma.log.findMany({
            where: { weddingId: wedding.id },
            orderBy: { createdAt: "desc" },
            take: 50
        });

        return NextResponse.json(logs);
    } catch (error: any) {
        console.error("Error fetching logs:", error);
        // Write error to a file for debugging
        try {
            const logPath = require('path').join(process.cwd(), 'api-error.log');
            fs.appendFileSync(logPath, `${new Date().toISOString()} - ${error.message}\n${error.stack}\n---\n`);
        } catch (e) { }

        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
