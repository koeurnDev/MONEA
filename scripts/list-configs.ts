import { prisma } from "../src/lib/prisma";

async function checkConfig() {
    const configs = await prisma.systemConfig.findMany();
    console.log("CONFIGS_FOUND:", JSON.stringify(configs, null, 2));
}

checkConfig().catch(console.error);
