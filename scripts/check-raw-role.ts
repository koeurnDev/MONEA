
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function check() {
    try {
        const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } });
        if (users.length > 0) {
            const raw = await (prisma as any).$queryRawUnsafe(
                'SELECT "sessionsRevokedAt", role FROM "User" WHERE id = $1 LIMIT 1',
                users[0].id
            );
            console.log("Raw SQL Output:", JSON.stringify(raw, null, 2));
            console.log("Role typeof:", typeof raw[0]?.role, "Value:", raw[0]?.role);
        }
    } catch (e) {
        console.error("Check failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
