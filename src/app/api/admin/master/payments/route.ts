import { NextResponse } from "next/server";
import { prisma, queryRaw, executeRaw } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { SystemGovernance, GOVERNANCE_ACTIONS } from "@/lib/governance";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Use raw query for config to prevent Prisma client lockups
        const configs = await queryRaw('SELECT "stadPrice", "proPrice" FROM "SystemConfig" LIMIT 1');
        const config = configs[0] || null;

        // Use raw query for weddings specifically to bypass Prisma synchronization issues on Windows
        const pendingWeddings = await queryRaw(`
            SELECT 
                w.id,
                w."groomName",
                w."brideName",
                w."packageType",
                w."paymentStatus",
                w.status,
                w."paymentHash",
                w."bakongTrxId",
                w."createdAt",
                json_build_object('name', u.name, 'email', u.email) as user
            FROM "Wedding" w
            LEFT JOIN "User" u ON w."userId" = u.id
            WHERE w."packageType" != 'FREE'
            ORDER BY w."createdAt" DESC
        `);

        return NextResponse.json({
            weddings: pendingWeddings || [],
            pricing: {
                standard: config?.stadPrice || 9,
                pro: config?.proPrice || 19
            }
        });
    } catch (error) {
        console.error("Payment Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { weddingId, status, packageType } = body;

        if (!weddingId || !status) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Use raw SQL update with retry logic for total stability
        let retries = 3;
        while (retries > 0) {
            try {
                await executeRaw(`
                    UPDATE "Wedding"
                    SET "paymentStatus" = $1, "status" = 'ACTIVE', "packageType" = COALESCE($2, "packageType")
                    WHERE "id" = $3
                `, status, packageType || null, weddingId);
                break;
            } catch (err: any) {
                retries--;
                if (retries === 0) throw err;
                await new Promise(r => setTimeout(r, 1000));
            }
        }

        // Fetch back the updated wedding to return
        const updatedWeddings = await queryRaw('SELECT * FROM "Wedding" WHERE id = $1 LIMIT 1', weddingId);
        const updatedWedding = updatedWeddings[0];

        // Use the centralized governance for auditing
        await SystemGovernance.logAction(
            user.id,
            user.name || user.email || "Platform Owner",
            GOVERNANCE_ACTIONS.CONFIG_UPDATE, 
            { 
                target: "WEDDING_PAYMENT",
                weddingId, 
                packageType, 
                status 
            }
        );

        return NextResponse.json(updatedWedding || { success: true });
    } catch (error) {
        console.error("Payment Verification Error:", error);
        return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
    }
}
