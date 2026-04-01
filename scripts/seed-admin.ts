
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function seedAdmin() {
    try {
        console.log("Seeding Admin account...");
        const hashedPassword = await bcrypt.hash("admin123", 10);
        
        // Cast 'SUPERADMIN' to "UserRole" enum
        await (prisma as any).$executeRawUnsafe(
            `INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt") 
             VALUES ($1, $2, $3, $4, $5::"UserRole", NOW(), NOW())
             ON CONFLICT (email) DO NOTHING`,
            "admin-id", "admin@monea.com", hashedPassword, "Master Admin", "SUPERADMIN"
        );

        console.log("SUCCESS: Admin seeded (admin@monea.com / admin123).");
    } catch (e) {
        console.error("ADMIN SEED FAILED:", e);
    }
}

seedAdmin();
