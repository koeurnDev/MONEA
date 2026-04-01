export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";

export async function GET() {
    try {
        const user = await getServerUser();
        if (!user) {
            console.warn("[Auth Me Debug] Unauthorized: getServerUser returned null. Cookies: " + cookies().getAll().map((c: any) => c.name).join(", "));
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.log(`[Auth Me Debug] Success: User ${user.userId}, Type ${user.type}`);

        // For staff users, return minimal data
        if (user.type === "staff") {
            return NextResponse.json({
                id: user.userId,
                role: user.role,
                name: user.name,
                type: "staff"
            });
        }

        // For admin/owner users, fetch full profile using Raw SQL to bypass Prisma Client issues
        const results = await (prisma as any).$queryRawUnsafe(`
            SELECT 
                id, name, email, role, "createdAt", "twoFactorEnabled"
            FROM "User" 
            WHERE id = $1 
            LIMIT 1
        `, user.userId);

        const dbUser = results[0];

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Use standard Prisma count
        const weddingCount = await prisma.wedding.count({
            where: { userId: user.userId }
        });
        
        const responseData = {
            ...dbUser,
            type: "admin",
            _count: { weddings: weddingCount }
        };

        return NextResponse.json(responseData);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
