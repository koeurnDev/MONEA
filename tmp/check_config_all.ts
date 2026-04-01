import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function check() {
    const configs = await prisma.systemConfig.findMany();
    console.log("All Configs:", JSON.stringify(configs, null, 2));
}

check().then(() => prisma.$disconnect());
