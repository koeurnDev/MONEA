import { prisma } from "../src/lib/prisma";

async function debug() {
    console.log("--- WEDDING DEBUG ---");
    const weddings = await prisma.wedding.findMany({ select: { id: true, userId: true, groomName: true } });
    for (const w of weddings) {
        console.log(`Wedding: ${w.groomName}. ID: ${w.id}. UserID: [${w.userId}] (Len: ${w.userId.length})`);
    }
    const users = await prisma.user.findMany({ select: { id: true, email: true } });
    for (const u of users) {
        console.log(`User: ${u.email}. ID: [${u.id}] (Len: ${u.id.length})`);
    }
}

debug().catch(console.error);
