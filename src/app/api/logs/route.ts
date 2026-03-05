export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import fs from 'fs';


// Legacy getUser removed in favor of getServerUser

export async function GET() {
    try {
        const user = await getServerUser();
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
