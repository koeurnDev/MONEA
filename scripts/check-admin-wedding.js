const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const userId = "cmlmznhjp0000scw7f0shshg7";
    const wedding = await prisma.wedding.findFirst({ where: { userId } });
    console.log("Admin Wedding:", JSON.stringify(wedding, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
