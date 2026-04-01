
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function check() {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, email: true, role: true }
        });
        console.log("Users and Roles:", JSON.stringify(users, null, 2));
    } catch (e) {
        console.error("Check failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
