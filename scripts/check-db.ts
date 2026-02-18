import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({ take: 5 });
    const weddings = await prisma.wedding.findMany({ take: 5 });
    const guests = await prisma.guest.count();
    const gifts = await prisma.gift.count();

    console.log("Users:", JSON.stringify(users, null, 2));
    console.log("Weddings:", JSON.stringify(weddings, null, 2));
    console.log("Total Guests:", guests);
    console.log("Total Gifts:", gifts);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
