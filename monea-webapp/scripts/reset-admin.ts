import { PrismaClient } from "@prisma/client";
import { CryptoUtils } from "../src/lib/crypto";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

async function reset() {
    console.log("Resetting admin password using app's CryptoUtils...");
    
    const pepper = process.env.SECURITY_PEPPER || "monea-dev-fallback-pepper";
    console.log("[Hash Info] Using Pepper:", pepper);
    // Hash the password using the exact same logic as the sign-in route
    const hashedPassword = await CryptoUtils.hash("password123");
    
    await prisma.user.upsert({
        where: { email: 'kook74532@gmail.com' },
        update: { password: hashedPassword, role: 'SUPERADMIN', failedAttempts: 0, lockedUntil: null },
        create: {
            email: 'kook74532@gmail.com',
            name: 'Koeurn',
            password: hashedPassword,
            role: 'SUPERADMIN',
        },
    });

    console.log("Admin password reset successfully to: password123");
}

reset()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
