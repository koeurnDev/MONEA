const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const userId = "cmlmznhjp0000scw7f0shshg7"; // superadmin@konyg.com

    // Find the wedding first
    const wedding = await prisma.wedding.findFirst({ where: { userId } });

    if (wedding) {
        console.log("Found wedding:", wedding.id);

        // Delete cascading manually since I'm in a script and want to be sure
        const guestCount = await prisma.guest.deleteMany({ where: { weddingId: wedding.id } });
        console.log("Deleted guests:", guestCount.count);

        const giftCount = await prisma.gift.deleteMany({ where: { weddingId: wedding.id } });
        console.log("Deleted gifts:", giftCount.count);

        const guestbookCount = await prisma.guestbookEntry.deleteMany({ where: { weddingId: wedding.id } });
        console.log("Deleted guestbook entries:", guestbookCount.count);

        const weddingDelete = await prisma.wedding.delete({ where: { id: wedding.id } });
        console.log("Deleted wedding record.");
    } else {
        console.log("No wedding found for this user.");
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
