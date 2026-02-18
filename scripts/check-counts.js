const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const weddings = await prisma.wedding.count();
    const guests = await prisma.guest.count();
    const gifts = await prisma.gift.count();
    console.log({ weddings, guests, gifts });

    if (weddings > 0) {
        const firstWedding = await prisma.wedding.findFirst();
        console.log("First Wedding:", JSON.stringify(firstWedding, null, 2));
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
