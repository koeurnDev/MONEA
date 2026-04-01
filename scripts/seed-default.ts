
import { prisma } from "../src/lib/prisma";

async function seed() {
    try {
        console.log("Seeding default data...");
        
        // 1. System Config (Corrected field name: maintenanceMode)
        await (prisma as any).$executeRawUnsafe(
            `INSERT INTO "SystemConfig" (id, "stadPrice", "proPrice", "maintenanceMode", "updatedAt") 
             VALUES ($1, $2, $3, $4, NOW())
             ON CONFLICT (id) DO NOTHING`,
            "GLOBAL", 9.00, 19.00, false
        );

        // 2. Sample Broadcast (To avoid empty errors if any)
        await (prisma as any).$executeRawUnsafe(
            `INSERT INTO "Broadcast" (id, title, message, active, "createdAt")
             VALUES ($1, $2, $3, $4, NOW())
             ON CONFLICT (id) DO NOTHING`,
            "WELCOME", "Welcome to MONEA 2.0", "New Bakong Automations are now live!", true
        );

        console.log("SUCCESS: Default data seeded.");
    } catch (e) {
        console.error("SEEDING FAILED:", e);
    }
}

seed();
