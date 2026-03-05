export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
    try {
        const user = await getServerUser();
        if (!user || (user.role !== "SUPERADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Basic Diagnostics & Health Checks
        const dbHealth = await prisma.$queryRaw`SELECT 1`.then(() => "HEALTHY").catch(() => "UNHEALTHY");

        // Cloudinary Health Check
        let cloudinaryHealth = "UNKNOWN";
        try {
            const result = await cloudinary.api.ping();
            if (result && result.status === "ok") cloudinaryHealth = "HEALTHY";
        } catch (e) {
            cloudinaryHealth = "UNHEALTHY";
        }

        const [userCount, weddingCount, guestCount, logCount] = await Promise.all([
            prisma.user.count(),
            prisma.wedding.count(),
            prisma.guest.count(),
            prisma.log.count()
        ]);

        const dbStats = {
            users: userCount,
            weddings: weddingCount,
            guests: guestCount,
            logs: logCount,
            health: dbHealth === "HEALTHY" && cloudinaryHealth === "HEALTHY" ? "HEALTHY" : "DEGRADED",
            services: {
                database: dbHealth,
                cloudinary: cloudinaryHealth
            },
            timestamp: new Date().toISOString()
        };

        return NextResponse.json(dbStats);
    } catch (error) {
        return NextResponse.json({ error: "Failed to run diagnostics" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getServerUser();
        if (!user || (user.role !== "SUPERADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { action } = await request.json();

        if (action === "VACUUM") {
            // Optimization for SQLite
            await prisma.$executeRawUnsafe("VACUUM");
            return NextResponse.json({ success: true, message: "Database optimized successfully" });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: "Maintenance action failed" }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        const user = await getServerUser();
        if (!user || (user.role !== "SUPERADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Cleanup: Remove logs older than 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const result = await prisma.log.deleteMany({
            where: {
                createdAt: { lt: thirtyDaysAgo }
            }
        });

        return NextResponse.json({ success: true, deletedCount: result.count });
    } catch (error) {
        return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
    }
}

