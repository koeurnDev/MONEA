const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("=== Seeding SystemVersion: v1.2.0 Baseline ===\n");

    // Ensure the GLOBAL SystemConfig exists
    const config = await prisma.systemConfig.findUnique({ where: { id: "GLOBAL" } });
    if (!config) {
        console.error("❌ SystemConfig (GLOBAL) not found. Run seed-system-config.js first.");
        process.exit(1);
    }

    const version = await prisma.systemVersion.create({
        data: {
            versionName: "v1.2.0 - Baseline",
            configData: JSON.stringify(config),
            description: "Platform baseline: Performance optimizations, CelestialElegance template, Governance dashboard, Template Version Control (Time Machine), Wedding Notes, Admin auth endpoints.",
            isStable: true,
            createdBy: "System (Antigravity)",
        }
    });

    console.log(`✅ Created SystemVersion: "${version.versionName}" [id: ${version.id}]`);
    console.log(`   Created at: ${version.createdAt}`);
    console.log(`   Stable: ${version.isStable}`);
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
