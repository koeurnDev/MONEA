export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const user = await getServerUser(req);
        
        if (!user) {
            console.log("[Auth /me] No valid user session found");
            // Return 200 to prevent browser from logging network error, client handles empty user
            return Response.json({ error: "Unauthorized" }, { status: 200 });
        }

        // For staff users, return minimal data
        if (user.type === "staff") {
            const staffData = {
                id:   user.userId,
                role: user.role,
                name: user.name,
                type: "staff",
                weddingId: user.weddingId,
            };
            console.log(`[Auth /me] Staff user authenticated: ${user.userId}`);
            return Response.json({ ...staffData, user: staffData });
        }

        // Single parallel query: user + wedding at the same time
        const [dbUser, firstWedding] = await Promise.all([
            prisma.user.findUnique({
                where: { id: user.userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    twoFactorEnabled: true,
                }
            }),
            prisma.wedding.findFirst({
                where: { userId: user.userId },
                orderBy: { createdAt: 'asc' },
                select: {
                    id: true,
                    groomName: true,
                    brideName: true,
                    date: true,
                    location: true,
                    status: true,
                    packageType: true,
                    eventType: true,
                    templateId: true,
                    themeSettings: true,
                    createdAt: true,
                },
            }),
        ]);

        if (!dbUser) {
            console.warn(`[Auth /me] User ${user.userId} not found in database`);
            return Response.json({ error: "User not found" }, { status: 404 });
        }

        const userData = {
            ...dbUser,
            type: "user",
            weddingId: firstWedding?.id ?? null,
            wedding: firstWedding ?? null,
            _count: { weddings: firstWedding ? 1 : 0 },
        };

        console.log(`[Auth /me] User authenticated: ${user.userId}, role: ${dbUser.role}`);
        return Response.json({ ...userData, user: userData });
    } catch (error) {
        console.error("[Auth /me] Error:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const user = await getServerUser(req);
        if (!user || (!user.userId && !user.id)) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, email } = await req.json();
        const targetUserId = user.userId || user.id;

        const updateData: any = {};
        if (name && typeof name === "string") updateData.name = name.trim();
        if (email && typeof email === "string" && email.includes("@")) {
            const cleanEmail = email.toLowerCase().trim();
            const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
            if (existing && existing.id !== targetUserId) {
                return Response.json({ error: "Email នេះត្រូវបានប្រើប្រាស់រួចហើយ" }, { status: 400 });
            }
            updateData.email = cleanEmail;
        }

        const updatedUser = await prisma.user.update({
            where: { id: targetUserId },
            data: updateData,
            select: { id: true, name: true, email: true, role: true }
        });

        return Response.json({ success: true, user: updatedUser });
    } catch (e) {
        console.error("[Auth /me PUT] Error:", e);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
