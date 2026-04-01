const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    console.log("Testing DB connection...");
    try {
        const result = await prisma.$queryRaw`SELECT 1 as connected`;
        console.log("SUCCESS:", result);
    } catch (e) {
        console.error("FAILURE:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

test();
