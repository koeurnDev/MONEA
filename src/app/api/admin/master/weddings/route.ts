export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma, queryRaw } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export async function GET(req: Request) {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = 20;
        const skip = (page - 1) * limit;

        const searchPattern = `%${search}%`;

        // Use raw query for stability on Windows
        const weddings = await queryRaw(`
            SELECT 
                w.*,
                json_build_object('name', u.name, 'email', u.email) as user,
                json_build_object('guests', (SELECT count(*) FROM "Guest" g WHERE g."weddingId" = w.id), 
                                'gifts', (SELECT count(*) FROM "Gift" gi WHERE gi."weddingId" = w.id)) as _count
            FROM "Wedding" w
            LEFT JOIN "User" u ON w."userId" = u.id
            WHERE w."groomName" ILIKE $1 OR w."brideName" ILIKE $1 OR w."weddingCode" ILIKE $1
            ORDER BY w."createdAt" DESC
            LIMIT $2 OFFSET $3
        `, searchPattern, limit, skip);

        const totalResults = await queryRaw(`
            SELECT count(*) as count FROM "Wedding"
            WHERE "groomName" ILIKE $1 OR "brideName" ILIKE $1 OR "weddingCode" ILIKE $1
        `, searchPattern);
        
        const total = Number(totalResults[0]?.count || 0);

        return NextResponse.json({
            weddings,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        });

    } catch (error) {
        console.error("Master Weddings Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
