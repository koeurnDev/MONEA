export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma, queryRaw } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export async function GET(req: Request) {
    const user = await getServerUser();
    if (!user || user.role !== ROLES.PLATFORM_OWNER) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    try {
        const users = await queryRaw(`
            SELECT 
                u.id, 
                u.email, 
                u.role, 
                u."createdAt", 
                u."deletedAt",
                (SELECT json_agg(json_build_object('id', w.id, 'groomName', w."groomName", 'brideName', w."brideName", 'status', w.status)) 
                 FROM "Wedding" w WHERE w."userId" = u.id) as weddings
            FROM "User" u
            ORDER BY u."createdAt" DESC
            LIMIT $1 OFFSET $2
        `, limit, skip);

        const totalResults = await queryRaw('SELECT count(*) as count FROM "User"');
        const total = Number(totalResults[0]?.count || 0);

        return NextResponse.json({
            data: users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        console.error("[Admin Users API] Error:", error);
        return NextResponse.json({ 
            error: "Internal Server Error", 
            message: "An unexpected error occurred while retrieving users." 
        }, { status: 500 });
    }
}
