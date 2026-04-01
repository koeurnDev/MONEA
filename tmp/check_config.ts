import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function check() {
    const config = await prisma.systemConfig.findUnique({ where: { id: "GLOBAL" } });
    console.log("Bakong Config:", JSON.stringify(config?.bakongConfig, null, 2));
}

check().then(() => prisma.$disconnect());
