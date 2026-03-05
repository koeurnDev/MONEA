const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const w = await prisma.wedding.count();
        const g = await prisma.guest.count();
        console.log('COUNT_RESULT:', JSON.stringify({ weddings: w, guests: g }));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
