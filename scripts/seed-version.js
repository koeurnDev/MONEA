const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const wedding = await prisma.wedding.findFirst({
        orderBy: { updatedAt: 'desc' }
    });

    if (!wedding) {
        console.log("No wedding found.");
        return;
    }

    const version = await prisma.weddingTemplateVersion.create({
        data: {
            weddingId: wedding.id,
            versionName: "Initial Design Snapshot",
            description: "Automatically captured after governance implementation",
            templateId: wedding.templateId,
            themeData: wedding.themeSettings || "{}",
            createdBy: "System (Antigravity)"
        }
    });

    console.log(`Created version: ${version.versionName} for wedding: ${wedding.groomName} & ${wedding.brideName}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
