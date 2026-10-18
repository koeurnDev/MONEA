import { PrismaClient } from "@prisma/client";
import { CryptoUtils } from "../src/lib/crypto";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

async function reset() {
    console.log("Resetting admin password using app's CryptoUtils...");
    
    // Password must come from the environment; never hard-code credentials.
    const newPassword = process.env.ADMIN_RESET_PASSWORD;
    if (!newPassword || newPassword.length < 12) {
        throw new Error("Set ADMIN_RESET_PASSWORD (min 12 characters) before running this script.");
    }
    // Hash the password using the exact same logic as the sign-in route
    const hashedPassword = await CryptoUtils.hash(newPassword);
    
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

    console.log("Admin password reset successfully.");
}

reset()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
