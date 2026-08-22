import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

async function unlock() {
    console.log("Unlocking user accounts and clearing IP bans...");

    const userCount = await prisma.user.updateMany({
        where: {},
        data: { lockedUntil: null, failedAttempts: 0 }
    });

    const ipCount = await prisma.ipSecurity.deleteMany({});
    
    // Also clear the `blacklistedIP` table just in case they added themselves locally
    const blackCount = await prisma.blacklistedIP.deleteMany({});

    console.log(`Unlocked ${userCount.count} users, cleared ${ipCount.count} IP records, and ${blackCount.count} blacklists.`);
}

unlock()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
