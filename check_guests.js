const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const guests = await prisma.guest.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        console.log("Recent Guests:");
        console.log(JSON.stringify(guests, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
