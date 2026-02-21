const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("=== GOVERNANCE DB DIAGNOSTIC ===\n");

    const config = await prisma.systemConfig.findUnique({ where: { id: "GLOBAL" } });
    console.log("SystemConfig (GLOBAL):", config ? "EXISTS ✅" : "MISSING ❌");
    if (config) console.log("  →", JSON.stringify(config));

    const versions = await prisma.systemVersion.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
    console.log(`\nSystemVersion count: ${versions.length}`);
    versions.forEach(v => console.log(`  → [${v.id}] ${v.versionName}`));

    const templateVersions = await prisma.weddingTemplateVersion.findMany({ take: 5 });
    console.log(`\nWeddingTemplateVersion count: ${templateVersions.length}`);
    templateVersions.forEach(v => console.log(`  → [${v.id}] ${v.versionName} (wedding: ${v.weddingId})`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
