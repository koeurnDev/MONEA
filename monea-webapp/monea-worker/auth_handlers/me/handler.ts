export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const user = await getServerUser(req);
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

        // For staff users, return minimal data
        if (user.type === "staff") {
            return Response.json({
                id:   user.userId,
                role: user.role,
                name: user.name,
                type: "staff",
            });
        }

        const results = await (prisma as any).$queryRawUnsafe(`
            SELECT id, name, email, role, "createdAt", "twoFactorEnabled"
            FROM "User" WHERE id = $1 LIMIT 1
        `, user.userId);

        const dbUser = results[0];
        if (!dbUser) return Response.json({ error: "User not found" }, { status: 404 });

        const weddingCount = await prisma.wedding.count({ where: { userId: user.userId } });

        return Response.json({ ...dbUser, type: "admin", _count: { weddings: weddingCount } });
    } catch (error) {
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
