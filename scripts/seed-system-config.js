const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("=== Seeding SystemConfig + Initial SystemVersion ===\n");

    // 1. Create or ensure SystemConfig GLOBAL exists
    const config = await prisma.systemConfig.upsert({
        where: { id: "GLOBAL" },
        create: {
            id: "GLOBAL",
            maintenanceMode: false,
            allowNewSignups: true,
            globalCheckIn: true,
        },
        update: {} // Don't change settings, just ensure it exists
    });
    console.log("SystemConfig (GLOBAL): OK ✅", JSON.stringify(config));

    // 2. Create a baseline SystemVersion snapshot
    const existing = await prisma.systemVersion.count();
    if (existing === 0) {
        const version = await prisma.systemVersion.create({
            data: {
                versionName: "v1.0.0 - Baseline",
                configData: JSON.stringify(config),
                description: "Initial system baseline snapshot — auto-generated",
                isStable: true,
                createdBy: "System"
            }
        });
        console.log("Created SystemVersion:", version.versionName, "✅");
    } else {
        console.log(`SystemVersion already has ${existing} record(s), skipping.`);
    }

    console.log("\nDone! Rollback should now work.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
